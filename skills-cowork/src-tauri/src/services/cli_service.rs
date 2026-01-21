use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tokio::time::{timeout, Duration};
use log::{info, error, warn, debug};
use crate::utils::AppError;
use crate::models::ChatMessage;

pub struct CliService {
    cli_process: Arc<Mutex<Option<std::process::Child>>>,
    output_sender: mpsc::UnboundedSender<String>,
    output_receiver: Arc<Mutex<mpsc::UnboundedReceiver<String>>>,
    is_running: Arc<Mutex<bool>>,
}

impl CliService {
    pub fn new() -> Self {
        let (output_sender, output_receiver) = mpsc::unbounded_channel();
        
        CliService {
            cli_process: Arc::new(Mutex::new(None)),
            output_sender,
            output_receiver: Arc::new(Mutex::new(output_receiver)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }
    
    /// 启动Claude Code CLI
    pub async fn start_cli(&self) -> Result<(), AppError> {
        info!("Starting Claude Code CLI");
        
        // 检查CLI是否已经在运行
        {
            let is_running = self.is_running.lock().unwrap();
            if *is_running {
                warn!("CLI is already running");
                return Ok(());
            }
        }
        
        // 启动CLI进程
        let mut child = Command::new("claude")
            .arg("--api-key-from-env") // 使用环境变量中的API key
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| AppError::Cli(format!("Failed to start CLI: {}", e)))?;
        
        // 获取stdin
        let stdin = child.stdin.take()
            .ok_or_else(|| AppError::Cli("Failed to get stdin".to_string()))?;
        
        // 获取stdout和stderr
        let stdout = child.stdout.take()
            .ok_or_else(|| AppError::Cli("Failed to get stdout".to_string()))?;
        
        let stderr = child.stderr.take()
            .ok_or_else(|| AppError::Cli("Failed to get stderr".to_string()))?;
        
        // 克隆需要的值
        let output_sender = self.output_sender.clone();
        let is_running_clone = self.is_running.clone();
        
        // 启动stdout读取任务
        tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        debug!("CLI stdout: {}", line);
                        if let Err(e) = output_sender.send(line) {
                            error!("Failed to send CLI output: {}", e);
                            break;
                        }
                    }
                    Err(e) => {
                        error!("Error reading CLI stdout: {}", e);
                        break;
                    }
                }
            }
        });
        
        // 启动stderr读取任务
        let output_sender_stderr = self.output_sender.clone();
        tokio::spawn(async move {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        debug!("CLI stderr: {}", line);
                        if let Err(e) = output_sender_stderr.send(format!("[ERROR] {}", line)) {
                            error!("Failed to send CLI stderr: {}", e);
                            break;
                        }
                    }
                    Err(e) => {
                        error!("Error reading CLI stderr: {}", e);
                        break;
                    }
                }
            }
        });
        
        // 保存进程
        {
            let mut process_ref = self.cli_process.lock().unwrap();
            *process_ref = Some(child);
        }
        
        // 设置运行状态
        {
            let mut is_running = self.is_running.lock().unwrap();
            *is_running = true;
        }
        
        info!("Claude Code CLI started successfully");
        Ok(())
    }
    
    /// 停止CLI
    pub async fn stop_cli(&self) -> Result<(), AppError> {
        info!("Stopping Claude Code CLI");
        
        // 终止进程
        {
            let mut process_ref = self.cli_process.lock().unwrap();
            if let Some(mut child) = process_ref.take() {
                child.kill()
                    .map_err(|e| AppError::Cli(format!("Failed to kill CLI process: {}", e)))?;
            }
        }
        
        // 更新运行状态
        {
            let mut is_running = self.is_running.lock().unwrap();
            *is_running = false;
        }
        
        info!("Claude Code CLI stopped");
        Ok(())
    }
    
    /// 发送消息到CLI
    pub async fn send_message(&self, message: &str) -> Result<(), AppError> {
        debug!("Sending message to CLI: {}", message);
        
        let process_ref = self.cli_process.lock().unwrap();
        if let Some(child) = process_ref.as_ref() {
            if let Some(stdin) = &child.stdin {
                let mut stdin = stdin.clone();
                let message_with_newline = format!("{}\n", message);
                
                stdin.write_all(message_with_newline.as_bytes())
                    .map_err(|e| AppError::Cli(format!("Failed to write to CLI stdin: {}", e)))?;
                
                stdin.flush()
                    .map_err(|e| AppError::Cli(format!("Failed to flush CLI stdin: {}", e)))?;
                
                debug!("Message sent to CLI successfully");
                return Ok(());
            }
        }
        
        Err(AppError::Cli("CLI is not running or stdin not available".to_string()))
    }
    
    /// 监听CLI输出流
    pub async fn listen_to_output(&self, window: tauri::Window, event_name: &str) -> Result<(), AppError> {
        info!("Starting to listen to CLI output");
        
        let receiver = Arc::clone(&self.output_receiver);
        let output_sender = self.output_sender.clone();
        
        tokio::spawn(async move {
            let mut receiver = receiver.lock().unwrap();
            let window_clone = window.clone();
            let event_name = event_name.to_string();
            
            while let Some(output) = receiver.recv().await {
                if let Err(e) = window_clone.emit(&event_name, &output) {
                    error!("Failed to emit CLI output event: {}", e);
                }
            }
        });
        
        Ok(())
    }
    
    /// 检查CLI是否正在运行
    pub fn is_cli_running(&self) -> bool {
        let is_running = self.is_running.lock().unwrap();
        *is_running
    }
    
    /// 获取CLI输出（阻塞方式）
    pub async fn get_output(&self, timeout_secs: u64) -> Result<String, AppError> {
        let receiver = Arc::clone(&self.output_receiver);
        let mut receiver = receiver.lock().unwrap();
        
        let timeout_duration = Duration::from_secs(timeout_secs);
        
        match timeout(timeout_duration, receiver.recv()).await {
            Some(Some(output)) => Ok(output),
            Some(None) => Err(AppError::Cli("CLI output channel closed".to_string())),
            None => Err(AppError::Timeout("Timeout waiting for CLI output".to_string())),
        }
    }
    
    /// 重启CLI
    pub async fn restart_cli(&self) -> Result<(), AppError> {
        info!("Restarting Claude Code CLI");
        
        self.stop_cli().await?;
        tokio::time::sleep(Duration::from_secs(1)).await; // 等待进程完全结束
        self.start_cli().await?;
        
        info!("Claude Code CLI restarted successfully");
        Ok(())
    }
}

impl Default for CliService {
    fn default() -> Self {
        CliService::new()
    }
}
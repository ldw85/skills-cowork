use std::path::PathBuf;
use std::fs;
use serde::{Deserialize, Serialize};
use log::{info, error, debug};
use crate::models::{ApiConfig, AppConfig};
use crate::utils::{AppError, ensure_workspace_exists};

pub struct ConfigService {
    config_path: PathBuf,
}

impl ConfigService {
    pub fn new() -> Self {
        let config_path = ensure_workspace_exists()
            .unwrap_or_else(|_| PathBuf::from("./config"));
        
        ConfigService {
            config_path,
        }
    }
    
    /// 初始化配置服务
    pub async fn init(&mut self, app: &tauri::AppHandle) -> Result<(), AppError> {
        info!("Initializing config service");
        
        // 初始化文件配置
        self.init_file_config()?;
        
        info!("Config service initialized with file storage");
        Ok(())
    }
    
    /// 初始化文件配置
    fn init_file_config(&self) -> Result<(), AppError> {
        let config_dir = self.config_path.join("config");
        fs::create_dir_all(&config_dir)
            .map_err(AppError::Io)?;
        
        info!("Config service initialized with file storage");
        Ok(())
    }
    
    /// 保存API配置
    pub async fn save_api_config(&self, config: &ApiConfig) -> Result<(), AppError> {
        info!("Saving API config");
        
        let config_path = self.config_path.join("config").join("api_config.json");
        let content = serde_json::to_string_pretty(config)
            .map_err(|e| AppError::Json(e))?;
        
        fs::write(&config_path, content)
            .map_err(AppError::Io)?;
        
        debug!("API config saved to file");
        Ok(())
    }
    
    /// 加载API配置
    pub async fn load_api_config(&self) -> Result<ApiConfig, AppError> {
        debug!("Loading API config");
        
        let config_path = self.config_path.join("config").join("api_config.json");
        if config_path.exists() {
            let content = fs::read_to_string(&config_path)
                .map_err(AppError::Io)?;
            
            let config: ApiConfig = serde_json::from_str(&content)
                .map_err(|e| AppError::Json(e))?;
            
            debug!("API config loaded from file");
            return Ok(config);
        }
        
        // 返回默认配置
        debug!("Using default API config");
        Ok(ApiConfig::default())
    }
    
    /// 保存应用配置
    pub async fn save_app_config(&self, config: &AppConfig) -> Result<(), AppError> {
        info!("Saving app config");
        
        let config_path = self.config_path.join("config").join("app_config.json");
        let content = serde_json::to_string_pretty(config)
            .map_err(|e| AppError::Json(e))?;
        
        fs::write(&config_path, content)
            .map_err(AppError::Io)?;
        
        debug!("App config saved");
        Ok(())
    }
    
    /// 加载应用配置
    pub async fn load_app_config(&self) -> Result<AppConfig, AppError> {
        debug!("Loading app config");
        
        let config_path = self.config_path.join("config").join("app_config.json");
        if config_path.exists() {
            let content = fs::read_to_string(&config_path)
                .map_err(AppError::Io)?;
            
            let config: AppConfig = serde_json::from_str(&content)
                .map_err(|e| AppError::Json(e))?;
            
            debug!("App config loaded from file");
            return Ok(config);
        }
        
        // 返回默认配置
        debug!("Using default app config");
        Ok(AppConfig::default())
    }
    
    /// 保存API Key
    pub async fn save_api_key(&self, api_key: &str) -> Result<(), AppError> {
        info!("Saving API key");
        
        // 保存到环境变量
        std::env::set_var("CLAUDE_API_KEY", api_key);
        
        debug!("API key saved to environment");
        Ok(())
    }
    
    /// 获取API Key
    pub async fn get_api_key(&self) -> Result<String, AppError> {
        debug!("Loading API key");
        
        // 从环境变量获取
        if let Ok(api_key) = std::env::var("CLAUDE_API_KEY") {
            if !api_key.is_empty() {
                debug!("API key loaded from environment");
                return Ok(api_key);
            }
        }
        
        Err(AppError::Config("API key not found".to_string()))
    }
    
    /// 设置工作区路径
    pub async fn set_workspace_path(&self, path: &str) -> Result<(), AppError> {
        info!("Setting workspace path: {}", path);
        
        let mut app_config = self.load_app_config().await?;
        app_config.workspace_path = path.to_string();
        
        self.save_app_config(&app_config).await?;
        
        debug!("Workspace path updated");
        Ok(())
    }
    
    /// 获取工作区路径
    pub async fn get_workspace_path(&self) -> Result<String, AppError> {
        let app_config = self.load_app_config().await?;
        Ok(app_config.workspace_path)
    }
    
    /// 保存聊天历史
    pub async fn save_chat_history(&self, sessions: Vec<crate::models::ChatSession>) -> Result<(), AppError> {
        info!("Saving chat history");
        
        let chat_history_path = self.config_path.join("chat-history");
        fs::create_dir_all(&chat_history_path)
            .map_err(AppError::Io)?;
        
        let history_path = chat_history_path.join("sessions.json");
        let content = serde_json::to_string_pretty(&sessions)
            .map_err(|e| AppError::Json(e))?;
        
        fs::write(&history_path, content)
            .map_err(AppError::Io)?;
        
        debug!("Chat history saved");
        Ok(())
    }
    
    /// 加载聊天历史
    pub async fn load_chat_history(&self) -> Result<Vec<crate::models::ChatSession>, AppError> {
        debug!("Loading chat history");
        
        let history_path = self.config_path.join("chat-history").join("sessions.json");
        if !history_path.exists() {
            debug!("No chat history found");
            return Ok(vec![]);
        }
        
        let content = fs::read_to_string(&history_path)
            .map_err(AppError::Io)?;
        
        let sessions: Vec<crate::models::ChatSession> = serde_json::from_str(&content)
            .map_err(|e| AppError::Json(e))?;
        
        debug!("Chat history loaded: {} sessions", sessions.len());
        Ok(sessions)
    }
}

impl Default for ConfigService {
    fn default() -> Self {
        ConfigService::new()
    }
}
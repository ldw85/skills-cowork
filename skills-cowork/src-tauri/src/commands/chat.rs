use tauri::Manager;
use log::{info, error, debug};
use uuid::Uuid;
use crate::services::{CliService, ConfigService};
use crate::models::{ChatMessage, ChatSession, MessageRole};
use crate::utils::{AppError, log_info, log_error};

pub async fn send_chat_message_command(
    session_id: String, 
    content: String, 
    attachments: Vec<String>,
    window: tauri::Window
) -> Result<String, String> {
    log_info(&format!("Sending chat message to session: {}", session_id));
    
    let cli_service = CliService::new();
    let mut config_service = ConfigService::new();
    
    // 启动CLI（如果未运行）
    if !cli_service.is_cli_running() {
        match cli_service.start_cli().await {
            Ok(_) => {
                log_info("CLI started successfully");
                // 监听CLI输出流
                let _ = cli_service.listen_to_output(window.clone(), "chat-output").await;
            }
            Err(e) => {
                log_error(&format!("Failed to start CLI: {}", e));
                return Err(e.to_string());
            }
        }
    }
    
    // 构建消息
    let message = ChatMessage::new_user(content);
    
    // 发送消息到CLI
    match cli_service.send_message(&message.content).await {
        Ok(_) => {
            log_info("Message sent to CLI successfully");
            
            // 更新会话
            if let Ok(mut sessions) = load_chat_sessions_command().await {
                if let Some(session) = sessions.iter_mut().find(|s| s.id == session_id) {
                    session.add_message(message.clone());
                    let _ = save_chat_sessions_command(sessions).await;
                }
            }
            
            Ok("Message sent successfully".to_string())
        }
        Err(e) => {
            log_error(&format!("Failed to send message to CLI: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn listen_chat_stream_command(window: tauri::Window) -> Result<(), String> {
    log_info("Starting to listen to chat stream");
    
    let cli_service = CliService::new();
    match cli_service.listen_to_output(window, "chat-stream").await {
        Ok(_) => {
            log_info("Chat stream listener started successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to start chat stream listener: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn load_chat_sessions_command() -> Result<Vec<ChatSession>, String> {
    log_info("Loading chat sessions");
    
    let config_service = ConfigService::new();
    match config_service.load_chat_history().await {
        Ok(sessions) => {
            log_info(&format!("Loaded {} chat sessions", sessions.len()));
            Ok(sessions)
        }
        Err(e) => {
            log_error(&format!("Failed to load chat sessions: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn create_chat_session_command(name: String) -> Result<ChatSession, String> {
    log_info(&format!("Creating chat session: {}", name));
    
    let mut config_service = ConfigService::new();
    
    let session = ChatSession::new(name.clone());
    
    // 保存会话
    match config_service.save_chat_history(vec![session.clone()]).await {
        Ok(_) => {
            log_info(&format!("Chat session created: {}", name));
            Ok(session)
        }
        Err(e) => {
            log_error(&format!("Failed to save chat session: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn save_chat_session_command(session: ChatSession) -> Result<(), String> {
    log_info(&format!("Saving chat session: {}", session.name));
    
    let config_service = ConfigService::new();
    
    // 加载现有会话
    let mut sessions = match config_service.load_chat_history().await {
        Ok(sessions) => sessions,
        Err(_) => vec![], // 如果加载失败，从空列表开始
    };
    
    // 更新或添加会话
    if let Some(existing_index) = sessions.iter().position(|s| s.id == session.id) {
        sessions[existing_index] = session.clone();
    } else {
        sessions.push(session);
    }
    
    // 保存所有会话
    match config_service.save_chat_history(sessions).await {
        Ok(_) => {
            log_info("Chat session saved successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save chat session: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn save_chat_sessions_command(sessions: Vec<ChatSession>) -> Result<(), String> {
    log_info(&format!("Saving {} chat sessions", sessions.len()));
    
    let config_service = ConfigService::new();
    match config_service.save_chat_history(sessions).await {
        Ok(_) => {
            log_info("Chat sessions saved successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save chat sessions: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn delete_chat_session_command(session_id: String) -> Result<(), String> {
    log_info(&format!("Deleting chat session: {}", session_id));
    
    let config_service = ConfigService::new();
    
    // 加载现有会话
    let mut sessions = match config_service.load_chat_history().await {
        Ok(sessions) => sessions,
        Err(e) => {
            log_error(&format!("Failed to load chat sessions: {}", e));
            return Err(e.to_string());
        }
    };
    
    // 移除指定会话
    sessions.retain(|s| s.id != session_id);
    
    // 保存更新后的会话列表
    match config_service.save_chat_history(sessions).await {
        Ok(_) => {
            log_info(&format!("Chat session deleted: {}", session_id));
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save chat sessions: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn clear_chat_session_command(session_id: String) -> Result<(), String> {
    log_info(&format!("Clearing chat session: {}", session_id));
    
    let config_service = ConfigService::new();
    
    // 加载现有会话
    let mut sessions = match config_service.load_chat_history().await {
        Ok(sessions) => sessions,
        Err(e) => {
            log_error(&format!("Failed to load chat sessions: {}", e));
            return Err(e.to_string());
        }
    };
    
    // 清除指定会话的消息
    if let Some(session) = sessions.iter_mut().find(|s| s.id == session_id) {
        session.clear_messages();
    }
    
    // 保存更新后的会话
    match config_service.save_chat_history(sessions).await {
        Ok(_) => {
            log_info(&format!("Chat session cleared: {}", session_id));
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save chat sessions: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn get_chat_session_command(session_id: String) -> Result<Option<ChatSession>, String> {
    log_info(&format!("Getting chat session: {}", session_id));
    
    let sessions = load_chat_sessions_command().await?;
    
    match sessions.into_iter().find(|s| s.id == session_id) {
        Some(session) => {
            log_info(&format!("Chat session found: {}", session.name));
            Ok(Some(session))
        }
        None => {
            log_info(&format!("Chat session not found: {}", session_id));
            Ok(None)
        }
    }
}

pub async fn update_session_name_command(session_id: String, new_name: String) -> Result<(), String> {
    log_info(&format!("Updating session name: {} -> {}", session_id, new_name));
    
    let config_service = ConfigService::new();
    
    // 加载现有会话
    let mut sessions = match config_service.load_chat_history().await {
        Ok(sessions) => sessions,
        Err(e) => {
            log_error(&format!("Failed to load chat sessions: {}", e));
            return Err(e.to_string());
        }
    };
    
    // 更新会话名称
    if let Some(session) = sessions.iter_mut().find(|s| s.id == session_id) {
        session.name = new_name;
    }
    
    // 保存更新后的会话
    match config_service.save_chat_history(sessions).await {
        Ok(_) => {
            log_info("Session name updated successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save chat sessions: {}", e));
            Err(e.to_string())
        }
    }
}
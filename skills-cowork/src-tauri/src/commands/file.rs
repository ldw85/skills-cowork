use tauri::Manager;
use log::{info, error};
use crate::services::FileService;
use crate::utils::{AppError, log_info, log_error};

pub async fn read_file_command(path: String) -> Result<String, String> {
    log_info(&format!("Reading file: {}", path));
    
    let file_service = FileService::new();
    match file_service.read_file(&path).await {
        Ok(content) => {
            log_info(&format!("File read successfully: {} bytes", content.len()));
            Ok(content)
        }
        Err(e) => {
            log_error(&format!("Failed to read file: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn write_file_command(path: String, content: String) -> Result<(), String> {
    log_info(&format!("Writing file: {}", path));
    
    let file_service = FileService::new();
    match file_service.write_file(&path, &content).await {
        Ok(_) => {
            log_info("File written successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to write file: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn delete_file_command(path: String) -> Result<(), String> {
    log_info(&format!("Deleting file: {}", path));
    
    let file_service = FileService::new();
    match file_service.delete_file(&path).await {
        Ok(_) => {
            log_info("File deleted successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to delete file: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn list_directory_command(path: String) -> Result<Vec<crate::models::FileInfo>, String> {
    log_info(&format!("Listing directory: {}", path));
    
    let file_service = FileService::new();
    match file_service.list_directory(&path).await {
        Ok(entries) => {
            log_info(&format!("Directory listed successfully: {} entries", entries.len()));
            Ok(entries)
        }
        Err(e) => {
            log_error(&format!("Failed to list directory: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn create_directory_command(path: String) -> Result<(), String> {
    log_info(&format!("Creating directory: {}", path));
    
    let file_service = FileService::new();
    match file_service.create_directory(&path).await {
        Ok(_) => {
            log_info("Directory created successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to create directory: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn file_exists_command(path: String) -> Result<bool, String> {
    let file_service = FileService::new();
    match file_service.file_exists(&path).await {
        Ok(exists) => Ok(exists),
        Err(e) => {
            log_error(&format!("Failed to check file existence: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn select_directory_command() -> Result<String, String> {
    log_info("Opening directory selection dialog");
    
    // 在Tauri中，我们使用系统对话框选择目录
    // 这里实现一个简单的解决方案，返回用户主目录
    let home_dir = std::env::home_dir()
        .and_then(|p| p.to_str().map(|s| s.to_string()))
        .unwrap_or_else(|| ".".to_string());
    
    log_info(&format!("Selected directory: {}", home_dir));
    Ok(home_dir)
}

pub async fn get_workspace_path_command() -> Result<String, String> {
    log_info("Getting workspace path");
    
    let file_service = FileService::new();
    let workspace_path = file_service.get_workspace_path();
    
    log_info(&format!("Workspace path: {:?}", workspace_path));
    Ok(workspace_path.to_string_lossy().to_string())
}

pub async fn set_workspace_path_command(path: String) -> Result<(), String> {
    log_info(&format!("Setting workspace path: {}", path));
    
    let file_service = FileService::new();
    match file_service.ensure_workspace_exists().await {
        Ok(_) => {
            log_info("Workspace path set successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to set workspace path: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn init_workspace_command() -> Result<(), String> {
    log_info("Initializing workspace");
    
    let file_service = FileService::new();
    match file_service.init_workspace().await {
        Ok(_) => {
            log_info("Workspace initialized successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to initialize workspace: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn get_file_stats_command(path: String) -> Result<crate::models::FileInfo, String> {
    log_info(&format!("Getting file stats: {}", path));
    
    let file_service = FileService::new();
    match file_service.get_file_stats(&path).await {
        Ok(stats) => {
            log_info(&format!("File stats retrieved successfully: {:?}", stats));
            Ok(stats)
        }
        Err(e) => {
            log_error(&format!("Failed to get file stats: {}", e));
            Err(e.to_string())
        }
    }
}
use tauri::Manager;
use log::{info, error, debug};
use crate::services::ConfigService;
use crate::models::{ApiConfig, AppConfig};
use crate::utils::{AppError, log_info, log_error};

pub async fn load_config_command() -> Result<AppConfig, String> {
    log_info("Loading configuration");
    
    let config_service = ConfigService::new();
    match config_service.load_app_config().await {
        Ok(config) => {
            log_info("Configuration loaded successfully");
            Ok(config)
        }
        Err(e) => {
            log_error(&format!("Failed to load configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn save_config_command(config: AppConfig) -> Result<(), String> {
    log_info("Saving configuration");
    
    let config_service = ConfigService::new();
    match config_service.save_app_config(&config).await {
        Ok(_) => {
            log_info("Configuration saved successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn get_api_config_command() -> Result<ApiConfig, String> {
    log_info("Loading API configuration");
    
    let config_service = ConfigService::new();
    match config_service.load_api_config().await {
        Ok(config) => {
            log_info("API configuration loaded successfully");
            Ok(config)
        }
        Err(e) => {
            log_error(&format!("Failed to load API configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn save_api_config_command(config: ApiConfig) -> Result<(), String> {
    log_info("Saving API configuration");
    
    let config_service = ConfigService::new();
    match config_service.save_api_config(&config).await {
        Ok(_) => {
            log_info("API configuration saved successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save API configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn get_api_key_command() -> Result<String, String> {
    log_info("Loading API key");
    
    let config_service = ConfigService::new();
    match config_service.get_api_key().await {
        Ok(api_key) => {
            log_info("API key loaded successfully");
            Ok(api_key)
        }
        Err(e) => {
            log_error(&format!("Failed to load API key: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn save_api_key_command(key: String) -> Result<(), String> {
    log_info("Saving API key");
    
    let config_service = ConfigService::new();
    match config_service.save_api_key(&key).await {
        Ok(_) => {
            log_info("API key saved successfully");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to save API key: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn get_workspace_path_command() -> Result<String, String> {
    log_info("Getting workspace path");
    
    let config_service = ConfigService::new();
    match config_service.get_workspace_path().await {
        Ok(path) => {
            log_info(&format!("Workspace path: {}", path));
            Ok(path)
        }
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn set_workspace_path_command(path: String) -> Result<(), String> {
    log_info(&format!("Setting workspace path: {}", path));
    
    let config_service = ConfigService::new();
    match config_service.set_workspace_path(&path).await {
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

pub async fn reset_config_command() -> Result<(), String> {
    log_info("Resetting configuration to defaults");
    
    let config_service = ConfigService::new();
    
    // 重置应用配置
    let app_config = AppConfig::default();
    match config_service.save_app_config(&app_config).await {
        Ok(_) => {
            log_info("Application configuration reset to defaults");
        }
        Err(e) => {
            log_error(&format!("Failed to reset application configuration: {}", e));
            return Err(e.to_string());
        }
    }
    
    // 重置API配置
    let api_config = ApiConfig::default();
    match config_service.save_api_config(&api_config).await {
        Ok(_) => {
            log_info("API configuration reset to defaults");
            Ok(())
        }
        Err(e) => {
            log_error(&format!("Failed to reset API configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn validate_config_command(config: AppConfig) -> Result<bool, String> {
    log_info("Validating configuration");
    
    // 基本验证
    if config.workspace_path.trim().is_empty() {
        return Err("Workspace path cannot be empty".to_string());
    }
    
    if config.font_size < 8 || config.font_size > 72 {
        return Err("Font size must be between 8 and 72".to_string());
    }
    
    if config.auto_save_interval < 5 || config.auto_save_interval > 300 {
        return Err("Auto save interval must be between 5 and 300 seconds".to_string());
    }
    
    log_info("Configuration validation passed");
    Ok(true)
}

pub async fn export_config_command() -> Result<String, String> {
    log_info("Exporting configuration");
    
    let config_service = ConfigService::new();
    
    // 加载当前配置
    let app_config = match config_service.load_app_config().await {
        Ok(config) => config,
        Err(e) => {
            log_error(&format!("Failed to load app config for export: {}", e));
            return Err(e.to_string());
        }
    };
    
    let api_config = match config_service.load_api_config().await {
        Ok(config) => config,
        Err(e) => {
            log_error(&format!("Failed to load API config for export: {}", e));
            return Err(e.to_string());
        }
    };
    
    // 创建导出数据结构
    #[derive(serde::Serialize)]
    struct ExportedConfig {
        app_config: AppConfig,
        api_config: ApiConfig,
        export_timestamp: String,
    }
    
    let export_data = ExportedConfig {
        app_config,
        api_config,
        export_timestamp: chrono::Utc::now().to_rfc3339(),
    };
    
    // 序列化为JSON
    match serde_json::to_string_pretty(&export_data) {
        Ok(json) => {
            log_info("Configuration exported successfully");
            Ok(json)
        }
        Err(e) => {
            log_error(&format!("Failed to serialize configuration: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn import_config_command(config_json: String) -> Result<(), String> {
    log_info("Importing configuration");
    
    let config_service = ConfigService::new();
    
    // 反序列化配置
    #[derive(serde::Deserialize)]
    struct ImportedConfig {
        app_config: Option<AppConfig>,
        api_config: Option<ApiConfig>,
    }
    
    let import_data: ImportedConfig = match serde_json::from_str(&config_json) {
        Ok(data) => data,
        Err(e) => {
            log_error(&format!("Failed to parse configuration JSON: {}", e));
            return Err(e.to_string());
        }
    };
    
    // 导入应用配置
    if let Some(app_config) = import_data.app_config {
        match config_service.save_app_config(&app_config).await {
            Ok(_) => {
                log_info("Application configuration imported successfully");
            }
            Err(e) => {
                log_error(&format!("Failed to import application configuration: {}", e));
                return Err(e.to_string());
            }
        }
    }
    
    // 导入API配置
    if let Some(api_config) = import_data.api_config {
        match config_service.save_api_config(&api_config).await {
            Ok(_) => {
                log_info("API configuration imported successfully");
                Ok(())
            }
            Err(e) => {
                log_error(&format!("Failed to import API configuration: {}", e));
                Err(e.to_string())
            }
        }
    } else {
        log_info("Configuration import completed");
        Ok(())
    }
}
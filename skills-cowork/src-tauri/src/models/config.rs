use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub base_url: String,
    pub model: String,
    pub timeout: u64,
    pub proxy: Option<String>,
}

impl Default for ApiConfig {
    fn default() -> Self {
        ApiConfig {
            provider: "openai".to_string(),
            api_key: None,
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4".to_string(),
            timeout: 30,
            proxy: None,
        }
    }
}

impl ApiConfig {
    pub fn new(provider: String) -> Self {
        ApiConfig {
            provider,
            api_key: None,
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4".to_string(),
            timeout: 30,
            proxy: None,
        }
    }

    pub fn is_valid(&self) -> bool {
        !self.provider.trim().is_empty() && 
        !self.api_key.as_ref().unwrap_or(&"".to_string()).trim().is_empty() &&
        !self.base_url.trim().is_empty()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub workspace_path: String,
    pub language: String,
    pub theme: String,
    pub font_size: u32,
    pub auto_save: bool,
    pub auto_save_interval: u64,
}

impl Default for AppConfig {
    fn default() -> Self {
        let home_dir = std::env::home_dir()
            .unwrap_or_default()
            .to_str()
            .unwrap_or("")
            .to_string();
        
        AppConfig {
            workspace_path: format!("{}/cto-skills/workspace", home_dir),
            language: "zh-CN".to_string(),
            theme: "light".to_string(),
            font_size: 14,
            auto_save: true,
            auto_save_interval: 30,
        }
    }
}

impl AppConfig {
    pub fn new(workspace_path: String) -> Self {
        AppConfig {
            workspace_path,
            language: "zh-CN".to_string(),
            theme: "light".to_string(),
            font_size: 14,
            auto_save: true,
            auto_save_interval: 30,
        }
    }
}
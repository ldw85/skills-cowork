use thiserror::Error;
use std::io;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),
    
    #[error("Path validation error: {0}")]
    PathValidation(String),
    
    #[error("File not found: {0}")]
    FileNotFound(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("CLI error: {0}")]
    Cli(String),
    
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Encryption error: {0}")]
    Encryption(String),
    
    #[error("Invalid argument: {0}")]
    InvalidArgument(String),
    
    #[error("Timeout: {0}")]
    Timeout(String),
    
    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl AppError {
    pub fn message(&self) -> String {
        self.to_string()
    }
}

impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.message()
    }
}

impl From<String> for AppError {
    fn from(s: String) -> Self {
        AppError::Unknown(s)
    }
}

impl From<&str> for AppError {
    fn from(s: &str) -> Self {
        AppError::Unknown(s.to_string())
    }
}
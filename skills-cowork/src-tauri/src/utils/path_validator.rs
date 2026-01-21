use std::path::{Path, PathBuf};
use crate::utils::AppError;

pub fn validate_path(path: &str) -> Result<PathBuf, AppError> {
    let path = Path::new(path);
    
    // 检查路径是否为空
    if path.as_os_str().is_empty() {
        return Err(AppError::PathValidation("Path cannot be empty".to_string()));
    }
    
    // 检查路径遍历攻击（../）
    let normalized = path_to_normalized_string(path);
    if normalized.contains("..") {
        return Err(AppError::PathValidation("Path traversal detected".to_string()));
    }
    
    // 检查是否包含非法字符
    if contains_illegal_chars(path) {
        return Err(AppError::PathValidation("Path contains illegal characters".to_string()));
    }
    
    // 转换为绝对路径（如果有基础路径的话）
    let absolute_path = if path.is_absolute() {
        path.to_path_buf()
    } else {
        // 这里应该使用工作区路径作为基础
        let workspace = get_workspace_path();
        workspace.join(path)
    };
    
    Ok(absolute_path)
}

pub fn is_within_workspace(path: &Path) -> bool {
    let workspace = get_workspace_path();
    
    // 获取绝对路径
    let path_abs = match path.canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };
    
    let workspace_abs = match workspace.canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };
    
    // 检查路径是否在工作区内
    path_abs.starts_with(workspace_abs)
}

pub fn get_workspace_path() -> PathBuf {
    let home_dir = std::env::home_dir()
        .unwrap_or_default()
        .to_str()
        .unwrap_or("")
        .to_string();
    
    PathBuf::from(format!("{}/cto-skills/workspace", home_dir))
}

pub fn ensure_workspace_exists() -> Result<PathBuf, AppError> {
    let workspace = get_workspace_path();
    
    std::fs::create_dir_all(&workspace)
        .map_err(AppError::Io)?;
    
    Ok(workspace)
}

fn path_to_normalized_string(path: &Path) -> String {
    path.to_string_lossy().replace("\\", "/")
}

fn contains_illegal_chars(path: &Path) -> bool {
    let illegal_chars = ['<', '>', ':', '"', '|', '?', '*'];
    
    let path_str = path.to_string_lossy();
    illegal_chars.iter().any(|c| path_str.contains(*c))
}

pub fn sanitize_filename(filename: &str) -> Result<String, AppError> {
    if filename.trim().is_empty() {
        return Err(AppError::InvalidArgument("Filename cannot be empty".to_string()));
    }
    
    let illegal_chars = ['<', '>', ':', '"', '|', '?', '*', '/', '\\'];
    let sanitized: String = filename
        .chars()
        .filter(|c| !illegal_chars.contains(c))
        .collect();
    
    if sanitized.is_empty() {
        return Err(AppError::InvalidArgument("Invalid filename after sanitization".to_string()));
    }
    
    Ok(sanitized)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_validate_safe_path() {
        let result = validate_path("src/main.rs");
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_validate_path_traversal() {
        let result = validate_path("../config.json");
        assert!(result.is_err());
    }
    
    #[test]
    fn test_sanitize_filename() {
        let result = sanitize_filename("file<>name.txt");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "filename.txt");
    }
}
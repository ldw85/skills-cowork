use std::fs;
use std::path::{Path, PathBuf};
use crate::models::FileInfo;
use crate::utils::{AppError, validate_path, get_workspace_path, ensure_workspace_exists};
use log::{info, error, debug};

pub struct FileService;

impl FileService {
    pub fn new() -> Self {
        FileService
    }
    
    /// 读取文件内容
    pub async fn read_file(&self, path: &str) -> Result<String, AppError> {
        info!("Reading file: {}", path);
        
        // 验证路径
        let validated_path = validate_path(path)?;
        
        if !validated_path.exists() {
            return Err(AppError::FileNotFound(path.to_string()));
        }
        
        if validated_path.is_dir() {
            return Err(AppError::InvalidArgument("Path is a directory, not a file".to_string()));
        }
        
        let content = fs::read_to_string(&validated_path)
            .map_err(AppError::Io)?;
            
        debug!("File read successfully: {} bytes", content.len());
        Ok(content)
    }
    
    /// 写入文件内容
    pub async fn write_file(&self, path: &str, content: &str) -> Result<(), AppError> {
        info!("Writing file: {}", path);
        
        // 验证路径
        let validated_path = validate_path(path)?;
        
        // 确保父目录存在
        if let Some(parent) = validated_path.parent() {
            fs::create_dir_all(parent)
                .map_err(AppError::Io)?;
        }
        
        fs::write(&validated_path, content)
            .map_err(AppError::Io)?;
            
        debug!("File written successfully");
        Ok(())
    }
    
    /// 删除文件
    pub async fn delete_file(&self, path: &str) -> Result<(), AppError> {
        info!("Deleting file: {}", path);
        
        // 验证路径
        let validated_path = validate_path(path)?;
        
        if !validated_path.exists() {
            return Err(AppError::FileNotFound(path.to_string()));
        }
        
        if validated_path.is_dir() {
            return Err(AppError::InvalidArgument("Use delete_directory for directories".to_string()));
        }
        
        fs::remove_file(&validated_path)
            .map_err(AppError::Io)?;
            
        debug!("File deleted successfully");
        Ok(())
    }
    
    /// 列出目录内容
    pub async fn list_directory(&self, path: &str) -> Result<Vec<FileInfo>, AppError> {
        info!("Listing directory: {}", path);
        
        // 验证路径
        let validated_path = validate_path(path)?;
        
        if !validated_path.exists() {
            return Err(AppError::FileNotFound(path.to_string()));
        }
        
        if !validated_path.is_dir() {
            return Err(AppError::InvalidArgument("Path is not a directory".to_string()));
        }
        
        let mut entries = Vec::new();
        
        for entry in fs::read_dir(&validated_path)
            .map_err(AppError::Io)? {
            
            match entry {
                Ok(entry) => {
                    let path = entry.path();
                    let file_info = FileInfo::new(&path);
                    entries.push(file_info);
                },
                Err(e) => error!("Error reading directory entry: {}", e),
            }
        }
        
        debug!("Directory listed successfully: {} entries", entries.len());
        Ok(entries)
    }
    
    /// 创建目录
    pub async fn create_directory(&self, path: &str) -> Result<(), AppError> {
        info!("Creating directory: {}", path);
        
        // 验证路径
        let validated_path = validate_path(path)?;
        
        fs::create_dir_all(&validated_path)
            .map_err(AppError::Io)?;
            
        debug!("Directory created successfully");
        Ok(())
    }
    
    /// 检查文件是否存在
    pub async fn file_exists(&self, path: &str) -> Result<bool, AppError> {
        // 验证路径
        let validated_path = validate_path(path)?;
        
        Ok(validated_path.exists())
    }
    
    /// 获取工作区路径
    pub fn get_workspace_path(&self) -> PathBuf {
        get_workspace_path()
    }
    
    /// 确保工作区存在
    pub async fn ensure_workspace_exists(&self) -> Result<PathBuf, AppError> {
        ensure_workspace_exists()
    }
    
    /// 初始化工作区目录结构
    pub async fn init_workspace(&self) -> Result<(), AppError> {
        info!("Initializing workspace");
        
        let workspace = ensure_workspace_exists()?;
        
        // 创建工作区子目录
        let subdirs = vec![
            "projects",
            "uploads", 
            "exports",
            "chat-history",
            "skill-packs",
        ];
        
        for subdir in subdirs {
            let subdir_path = workspace.join(subdir);
            fs::create_dir_all(&subdir_path)
                .map_err(AppError::Io)?;
        }
        
        info!("Workspace initialized successfully");
        Ok(())
    }
    
    /// 获取文件统计信息
    pub async fn get_file_stats(&self, path: &str) -> Result<FileInfo, AppError> {
        // 验证路径
        let validated_path = validate_path(path)?;
        
        if !validated_path.exists() {
            return Err(AppError::FileNotFound(path.to_string()));
        }
        
        Ok(FileInfo::new(&validated_path))
    }
}

impl Default for FileService {
    fn default() -> Self {
        FileService::new()
    }
}
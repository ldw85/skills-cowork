use reqwest::{Client, Response};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use log::{info, error, debug, warn};
use crate::utils::AppError;
use crate::models::HttpResponse;

pub struct NetworkService {
    client: Client,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub url: String,
    pub downloaded: u64,
    pub total: Option<u64>,
    pub percentage: f64,
}

impl NetworkService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| Client::new());
        
        NetworkService { client }
    }
    
    /// GET请求
    pub async fn get(&self, url: &str) -> Result<HttpResponse, AppError> {
        info!("Making GET request to: {}", url);
        
        match self.client.get(url).send().await {
            Ok(response) => {
                let status = response.status().as_u16();
                match response.text().await {
                    Ok(body) => {
                        debug!("GET request successful: status={}, body_length={}", status, body.len());
                        Ok(HttpResponse { status, body })
                    }
                    Err(e) => {
                        error!("Failed to read response body: {}", e);
                        Err(AppError::Request(e))
                    }
                }
            }
            Err(e) => {
                error!("GET request failed: {}", e);
                Err(AppError::Request(e))
            }
        }
    }
    
    /// POST请求
    pub async fn post(&self, url: &str, body: &str) -> Result<HttpResponse, AppError> {
        info!("Making POST request to: {}", url);
        
        match self.client.post(url)
            .body(body.to_string())
            .header("Content-Type", "application/json")
            .send()
            .await {
            Ok(response) => {
                let status = response.status().as_u16();
                match response.text().await {
                    Ok(body) => {
                        debug!("POST request successful: status={}, body_length={}", status, body.len());
                        Ok(HttpResponse { status, body })
                    }
                    Err(e) => {
                        error!("Failed to read response body: {}", e);
                        Err(AppError::Request(e))
                    }
                }
            }
            Err(e) => {
                error!("POST request failed: {}", e);
                Err(AppError::Request(e))
            }
        }
    }
    
    /// 带代理的GET请求
    pub async fn get_with_proxy(&self, url: &str, proxy: &str) -> Result<HttpResponse, AppError> {
        info!("Making GET request with proxy to: {}", url);
        
        let proxy = reqwest::Proxy::all(proxy)
            .map_err(|e| AppError::Network(format!("Invalid proxy configuration: {}", e)))?;
        
        let client = Client::builder()
            .proxy(proxy)
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| AppError::Network(format!("Failed to build proxy client: {}", e)))?;
        
        match client.get(url).send().await {
            Ok(response) => {
                let status = response.status().as_u16();
                match response.text().await {
                    Ok(body) => {
                        debug!("Proxy GET request successful: status={}, body_length={}", status, body.len());
                        Ok(HttpResponse { status, body })
                    }
                    Err(e) => {
                        error!("Failed to read proxy response body: {}", e);
                        Err(AppError::Request(e))
                    }
                }
            }
            Err(e) => {
                error!("Proxy GET request failed: {}", e);
                Err(AppError::Request(e))
            }
        }
    }
    
    /// 下载文件
    pub async fn download_file(&self, url: &str, dest_path: &str) -> Result<(), AppError> {
        info!("Downloading file from: {} to: {}", url, dest_path);
        
        let response = self.client.get(url)
            .send()
            .await
            .map_err(AppError::Request)?;
        
        if !response.status().is_success() {
            return Err(AppError::Network(format!("Download failed with status: {}", response.status())));
        }
        
        let total_size = response.content_length();
        let mut file = std::fs::File::create(dest_path)
            .map_err(AppError::Io)?;
        
        let mut downloaded = 0u64;
        let mut stream = response.bytes_stream();
        
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(AppError::Request)?;
            std::io::copy(&mut chunk.as_ref(), &mut file)
                .map_err(AppError::Io)?;
            
            downloaded += chunk.len() as u64;
            
            if let Some(total) = total_size {
                let percentage = (downloaded as f64 / total as f64) * 100.0;
                debug!("Download progress: {:.1}% ({}/{} bytes)", percentage, downloaded, total);
            } else {
                debug!("Downloaded: {} bytes", downloaded);
            }
        }
        
        info!("File downloaded successfully: {} bytes", downloaded);
        Ok(())
    }
    
    /// 下载技能包
    pub async fn download_skill_pack(&self, url: &str, dest_dir: &str) -> Result<String, AppError> {
        info!("Downloading skill pack from: {} to: {}", url, dest_dir);
        
        // 创建目标目录
        std::fs::create_dir_all(dest_dir)
            .map_err(AppError::Io)?;
        
        // 获取文件名
        let url_path = std::path::Path::new(url);
        let filename = url_path.file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("skill-pack.zip");
        
        let dest_path = format!("{}/{}", dest_dir, filename);
        
        // 下载文件
        self.download_file(url, &dest_path).await?;
        
        // 解压缩文件
        if filename.ends_with(".zip") {
            self.extract_zip(&dest_path, dest_dir).await?;
            
            // 删除压缩文件
            std::fs::remove_file(&dest_path)
                .map_err(AppError::Io)?;
            
            info!("Skill pack extracted successfully");
        }
        
        Ok(dest_dir.to_string())
    }
    
    /// 解压缩ZIP文件
    async fn extract_zip(&self, zip_path: &str, dest_dir: &str) -> Result<(), AppError> {
        debug!("Extracting zip file: {} to: {}", zip_path, dest_dir);
        
        let file = std::fs::File::open(zip_path)
            .map_err(AppError::Io)?;
        
        let mut zip = zip::ZipArchive::new(file)
            .map_err(|e| AppError::Network(format!("Failed to create zip archive: {}", e)))?;
        
        for i in 0..zip.len() {
            let mut entry = zip.by_index(i)
                .map_err(|e| AppError::Network(format!("Failed to read zip entry: {}", e)))?;
            
            let entry_path = dest_dir.to_string() + "/" + entry.name();
            
            if entry.is_dir() {
                std::fs::create_dir_all(&entry_path)
                    .map_err(AppError::Io)?;
            } else {
                // 确保父目录存在
                if let Some(parent) = std::path::Path::new(&entry_path).parent() {
                    std::fs::create_dir_all(parent)
                        .map_err(AppError::Io)?;
                }
                
                let mut out_file = std::fs::File::create(&entry_path)
                    .map_err(AppError::Io)?;
                
                std::io::copy(&mut entry, &mut out_file)
                    .map_err(AppError::Io)?;
            }
        }
        
        Ok(())
    }
    
    /// 检查网络连接
    pub async fn check_connectivity(&self) -> Result<bool, AppError> {
        debug!("Checking network connectivity");
        
        match self.client.get("https://httpbin.org/status/200")
            .timeout(Duration::from_secs(5))
            .send()
            .await {
            Ok(response) => {
                let is_connected = response.status().is_success();
                debug!("Network connectivity check: {}", if is_connected { "OK" } else { "FAILED" });
                Ok(is_connected)
            }
            Err(e) => {
                warn!("Network connectivity check failed: {}", e);
                Ok(false)
            }
        }
    }
    
    /// 设置超时时间
    pub fn set_timeout(&mut self, timeout_secs: u64) {
        let timeout = Duration::from_secs(timeout_secs);
        // 注意：在实际实现中，我们需要重新构建client
        debug!("Setting timeout to {} seconds", timeout_secs);
    }
}

impl Default for NetworkService {
    fn default() -> Self {
        NetworkService::new()
    }
}
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use log::{info, error};

// 文件系统命令
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn create_file(path: String, content: Option<String>) -> Result<(), String> {
    let content = content.unwrap_or_default();
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn create_folder(path: String) -> Result<(), String> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    match fs::remove_file(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn delete_folder(path: String) -> Result<(), String> {
    match fs::remove_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

// 文件树结构
#[derive(Debug, Serialize, Deserialize)]
struct FileNode {
    key: String,
    title: String,
    is_leaf: bool,
    children: Option<Vec<FileNode>>,
}

#[tauri::command]
async fn list_files(path: String) -> Result<Vec<FileNode>, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Ok(vec![]);
    }
    
    let mut result = Vec::new();
    
    if path.is_dir() {
        match fs::read_dir(path) {
            Ok(entries) => {
                for entry in entries {
                    match entry {
                        Ok(entry) => {
                            let path = entry.path();
                            let file_name = path.file_name()
                                .and_then(|s| s.to_str())
                                .unwrap_or("");
                            
                            let is_dir = path.is_dir();
                            let node = FileNode {
                                key: path.to_str().unwrap_or("").to_string(),
                                title: file_name.to_string(),
                                is_leaf: !is_dir,
                                children: if is_dir {
                                    Some(vec![]) // 懒加载子目录
                                } else {
                                    None
                                },
                            };
                            result.push(node);
                        },
                        Err(e) => error!("Error reading directory entry: {}", e),
                    }
                }
            },
            Err(e) => return Err(e.to_string()),
        }
    }
    
    Ok(result)
}

// 网络请求命令
#[derive(Serialize, Deserialize)]
struct HttpResponse {
    status: u16,
    body: String,
}

#[tauri::command]
async fn http_get(url: String) -> Result<HttpResponse, String> {
    match reqwest::get(&url).await {
        Ok(response) => {
            let status = response.status().as_u16();
            match response.text().await {
                Ok(body) => Ok(HttpResponse { status, body }),
                Err(e) => Err(e.to_string()),
            }
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn http_post(url: String, body: String) -> Result<HttpResponse, String> {
    match reqwest::Client::new()
        .post(&url)
        .json(&body)
        .send()
        .await
    {
        Ok(response) => {
            let status = response.status().as_u16();
            match response.text().await {
                Ok(body) => Ok(HttpResponse { status, body }),
                Err(e) => Err(e.to_string()),
            }
        },
        Err(e) => Err(e.to_string()),
    }
}

// 应用信息
#[derive(Serialize, Deserialize)]
struct AppInfo {
    name: String,
    version: String,
    platform: String,
}

#[tauri::command]
async fn get_app_info() -> Result<AppInfo, String> {
    Ok(AppInfo {
        name: "Skills Cowork".to_string(),
        version: "0.1.0".to_string(),
        platform: std::env::consts::OS.to_string(),
    })
}

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            create_file,
            create_folder,
            delete_file,
            delete_folder,
            list_files,
            http_get,
            http_post,
            get_app_info
        ])
        .setup(|app| {
            info!("Skills Cowork app starting up");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
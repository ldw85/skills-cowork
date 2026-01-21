use std::path::PathBuf;
use log::{info, error, debug};
use crate::services::{NetworkService, ConfigService};
use crate::utils::{AppError, log_info, log_error};

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub category: String,
    pub tags: Vec<String>,
    pub file_path: Option<String>,
    pub is_user_skill: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct SkillPack {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub skills: Vec<Skill>,
    pub download_url: Option<String>,
    pub is_installed: bool,
}

pub async fn load_all_skills_command() -> Result<Vec<Skill>, String> {
    log_info("Loading all skills");
    
    let mut skills = Vec::new();
    
    // 加载系统Skills（预定义的）
    let system_skills = load_system_skills().await?;
    skills.extend(system_skills);
    
    // 加载用户自定义Skills
    let user_skills = load_user_skills().await?;
    skills.extend(user_skills);
    
    log_info(&format!("Loaded {} skills", skills.len()));
    Ok(skills)
}

pub async fn load_skill_packs_command() -> Result<Vec<SkillPack>, String> {
    log_info("Loading skill packs");
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let skill_packs_dir = format!("{}/skill-packs", workspace_path);
    let skill_packs_path = PathBuf::from(&skill_packs_dir);
    
    let mut skill_packs = Vec::new();
    
    // 检查技能包目录是否存在
    if !skill_packs_path.exists() {
        log_info("Skill packs directory does not exist, creating it");
        std::fs::create_dir_all(&skill_packs_path)
            .map_err(|e| {
                log_error(&format!("Failed to create skill packs directory: {}", e));
                e.to_string()
            })?;
    }
    
    // 读取已安装的技能包
    match std::fs::read_dir(&skill_packs_path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        if path.is_dir() {
                            match load_skill_pack_from_dir(&path).await {
                                Ok(mut skill_pack) => {
                                    skill_pack.is_installed = true;
                                    skill_packs.push(skill_pack);
                                }
                                Err(e) => {
                                    log_error(&format!("Failed to load skill pack from {}: {}", path.display(), e));
                                }
                            }
                        }
                    }
                    Err(e) => {
                        log_error(&format!("Error reading directory entry: {}", e));
                    }
                }
            }
        }
        Err(e) => {
            log_error(&format!("Failed to read skill packs directory: {}", e));
        }
    }
    
    log_info(&format!("Loaded {} skill packs", skill_packs.len()));
    Ok(skill_packs)
}

pub async fn delete_user_skill_command(skill_id: String) -> Result<(), String> {
    log_info(&format!("Deleting user skill: {}", skill_id));
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let skill_path = format!("{}/skill-packs/user/{}", workspace_path, skill_id);
    let skill_path_buf = PathBuf::from(&skill_path);
    
    if !skill_path_buf.exists() {
        return Err(format!("Skill not found: {}", skill_id));
    }
    
    // 删除技能文件
    if skill_path_buf.is_dir() {
        std::fs::remove_dir_all(&skill_path_buf)
            .map_err(|e| {
                log_error(&format!("Failed to delete skill directory: {}", e));
                e.to_string()
            })?;
    } else {
        std::fs::remove_file(&skill_path_buf)
            .map_err(|e| {
                log_error(&format!("Failed to delete skill file: {}", e));
                e.to_string()
            })?;
    }
    
    log_info(&format!("User skill deleted: {}", skill_id));
    Ok(())
}

pub async fn uninstall_skill_pack_command(pack_id: String) -> Result<(), String> {
    log_info(&format!("Uninstalling skill pack: {}", pack_id));
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let pack_path = format!("{}/skill-packs/{}", workspace_path, pack_id);
    let pack_path_buf = PathBuf::from(&pack_path);
    
    if !pack_path_buf.exists() {
        return Err(format!("Skill pack not found: {}", pack_id));
    }
    
    // 删除技能包目录
    std::fs::remove_dir_all(&pack_path_buf)
        .map_err(|e| {
            log_error(&format!("Failed to delete skill pack: {}", e));
            e.to_string()
        })?;
    
    log_info(&format!("Skill pack uninstalled: {}", pack_id));
    Ok(())
}

pub async fn download_skill_pack_command(url: String, pack_id: String) -> Result<String, String> {
    log_info(&format!("Downloading skill pack: {} from {}", pack_id, url));
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let download_dir = format!("{}/skill-packs/downloads", workspace_path);
    let network_service = NetworkService::new();
    
    match network_service.download_skill_pack(&url, &download_dir).await {
        Ok(_) => {
            log_info(&format!("Skill pack downloaded: {}", pack_id));
            Ok(download_dir)
        }
        Err(e) => {
            log_error(&format!("Failed to download skill pack: {}", e));
            Err(e.to_string())
        }
    }
}

pub async fn install_skill_pack_command(pack_path: String) -> Result<(), String> {
    log_info(&format!("Installing skill pack from: {}", pack_path));
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let source_path = PathBuf::from(&pack_path);
    let dest_path = format!("{}/skill-packs/{}", workspace_path, source_path.file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown-pack"));
    
    if !source_path.exists() {
        return Err(format!("Skill pack source not found: {}", pack_path));
    }
    
    // 复制技能包到安装目录
    if source_path.is_dir() {
        copy_dir(&source_path, &dest_path)
            .map_err(|e| {
                log_error(&format!("Failed to copy skill pack: {}", e));
                e.to_string()
            })?;
    } else {
        std::fs::copy(&source_path, &dest_path)
            .map_err(|e| {
                log_error(&format!("Failed to copy skill pack file: {}", e));
                e.to_string()
            })?;
    }
    
    log_info(&format!("Skill pack installed: {}", dest_path));
    Ok(())
}

pub async fn create_user_skill_command(name: String, description: String, content: String) -> Result<String, String> {
    log_info(&format!("Creating user skill: {}", name));
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(e) => {
            log_error(&format!("Failed to get workspace path: {}", e));
            return Err(e.to_string());
        }
    };
    
    let user_skills_dir = format!("{}/skill-packs/user", workspace_path);
    let skill_path = format!("{}/{}.skill", user_skills_dir, name);
    
    // 确保用户技能目录存在
    std::fs::create_dir_all(&user_skills_dir)
        .map_err(|e| {
            log_error(&format!("Failed to create user skills directory: {}", e));
            e.to_string()
        })?;
    
    // 创建技能文件
    let skill_content = format!("# {}\n\n{}\n\n{}", name, description, content);
    std::fs::write(&skill_path, skill_content)
        .map_err(|e| {
            log_error(&format!("Failed to write skill file: {}", e));
            e.to_string()
        })?;
    
    log_info(&format!("User skill created: {}", name));
    Ok(name)
}

// 辅助函数
async fn load_system_skills() -> Result<Vec<Skill>, String> {
    debug("Loading system skills");
    
    // 这里可以加载预定义的系统Skills
    let system_skills = vec![
        Skill {
            id: "code-review".to_string(),
            name: "Code Review".to_string(),
            description: "Review code for best practices and potential issues".to_string(),
            version: "1.0.0".to_string(),
            author: "System".to_string(),
            category: "development".to_string(),
            tags: vec!["code".to_string(), "review".to_string()],
            file_path: None,
            is_user_skill: false,
        },
        Skill {
            id: "debug-assistant".to_string(),
            name: "Debug Assistant".to_string(),
            description: "Help debug code and identify issues".to_string(),
            version: "1.0.0".to_string(),
            author: "System".to_string(),
            category: "debugging".to_string(),
            tags: vec!["debug".to_string(), "assistance".to_string()],
            file_path: None,
            is_user_skill: false,
        },
    ];
    
    Ok(system_skills)
}

async fn load_user_skills() -> Result<Vec<Skill>, String> {
    debug("Loading user skills");
    
    let config_service = ConfigService::new();
    let workspace_path = match config_service.get_workspace_path().await {
        Ok(path) => path,
        Err(_) => return Ok(vec![]), // 如果无法获取工作区路径，返回空列表
    };
    
    let user_skills_dir = format!("{}/skill-packs/user", workspace_path);
    let user_skills_path = PathBuf::from(&user_skills_dir);
    
    let mut user_skills = Vec::new();
    
    if !user_skills_path.exists() {
        return Ok(vec![]);
    }
    
    match std::fs::read_dir(&user_skills_path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("skill") {
                            match load_skill_from_file(&path).await {
                                Ok(skill) => user_skills.push(skill),
                                Err(e) => {
                                    log_error(&format!("Failed to load skill from {}: {}", path.display(), e));
                                }
                            }
                        }
                    }
                    Err(e) => {
                        log_error(&format!("Error reading user skill entry: {}", e));
                    }
                }
            }
        }
        Err(e) => {
            log_error(&format!("Failed to read user skills directory: {}", e));
        }
    }
    
    Ok(user_skills)
}

async fn load_skill_from_file(path: &PathBuf) -> Result<Skill, String> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read skill file: {}", e))?;
    
    let lines: Vec<&str> = content.lines().collect();
    if lines.len() < 3 {
        return Err("Invalid skill file format".to_string());
    }
    
    let name = lines[0].trim_start_matches("# ").to_string();
    let description = lines[1].to_string();
    
    // 生成技能ID
    let skill_id = format!("user-{}", uuid::Uuid::new_v4());
    
    Ok(Skill {
        id: skill_id,
        name,
        description,
        version: "1.0.0".to_string(),
        author: "User".to_string(),
        category: "user".to_string(),
        tags: vec![],
        file_path: Some(path.to_string_lossy().to_string()),
        is_user_skill: true,
    })
}

async fn load_skill_pack_from_dir(path: &PathBuf) -> Result<SkillPack, String> {
    let pack_id = path.file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown-pack")
        .to_string();
    
    let pack_file = path.join("pack.json");
    let skills_dir = path.join("skills");
    
    let mut skill_pack = SkillPack {
        id: pack_id.clone(),
        name: pack_id.clone(),
        description: "Loaded skill pack".to_string(),
        version: "1.0.0".to_string(),
        author: "Unknown".to_string(),
        skills: vec![],
        download_url: None,
        is_installed: true,
    };
    
    // 尝试加载pack.json配置文件
    if pack_file.exists() {
        match std::fs::read_to_string(&pack_file) {
            Ok(content) => {
                match serde_json::from_str::<SkillPack>(&content) {
                    Ok(mut loaded_pack) => {
                        loaded_pack.is_installed = true;
                        return Ok(loaded_pack);
                    }
                    Err(e) => {
                        log_error(&format!("Failed to parse pack.json for {}: {}", pack_id, e));
                    }
                }
            }
            Err(e) => {
                log_error(&format!("Failed to read pack.json for {}: {}", pack_id, e));
            }
        }
    }
    
    // 如果没有pack.json，从目录结构推断
    if skills_dir.exists() {
        match std::fs::read_dir(&skills_dir) {
            Ok(entries) => {
                for entry in entries {
                    match entry {
                        Ok(entry) => {
                            let skill_path = entry.path();
                            if skill_path.is_file() {
                                // 这里可以加载具体的技能文件
                                // 暂时使用基本信息
                                let skill = Skill {
                                    id: format!("{}-skill-{}", pack_id, uuid::Uuid::new_v4()),
                                    name: skill_path.file_name()
                                        .and_then(|s| s.to_str())
                                        .unwrap_or("Unknown Skill")
                                        .to_string(),
                                    description: "Skill from pack".to_string(),
                                    version: "1.0.0".to_string(),
                                    author: pack_id.clone(),
                                    category: "pack".to_string(),
                                    tags: vec![],
                                    file_path: Some(skill_path.to_string_lossy().to_string()),
                                    is_user_skill: false,
                                };
                                skill_pack.skills.push(skill);
                            }
                        }
                        Err(e) => {
                            log_error(&format!("Error reading skill entry: {}", e));
                        }
                    }
                }
            }
            Err(e) => {
                log_error(&format!("Failed to read skills directory: {}", e));
            }
        }
    }
    
    Ok(skill_pack)
}

fn copy_dir(src: &PathBuf, dst: &PathBuf) -> Result<(), std::io::Error> {
    if !dst.exists() {
        std::fs::create_dir_all(dst)?;
    }
    
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        
        let dest_path = dst.join(entry.file_name());
        
        if file_type.is_dir() {
            copy_dir(&entry.path().to_path_buf(), &dest_path)?;
        } else {
            std::fs::copy(entry.path(), dest_path)?;
        }
    }
    
    Ok(())
}
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_dir: bool,
    pub created_at: Option<String>,
    pub modified_at: Option<String>,
    pub extension: Option<String>,
}

impl FileInfo {
    pub fn new(path: &std::path::Path) -> Self {
        let metadata = match std::fs::metadata(path) {
            Ok(m) => m,
            Err(_) => return Self::default(),
        };

        let name = path.file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_string();

        let extension = path.extension()
            .and_then(|s| s.to_str())
            .map(|s| s.to_string());

        let created_at = metadata.created().ok().map(|time| {
            time.duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
                .to_string()
        });

        let modified_at = metadata.modified().ok().map(|time| {
            time.duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
                .to_string()
        });

        FileInfo {
            name,
            path: path.to_str().unwrap_or("").to_string(),
            size: metadata.len(),
            is_dir: metadata.is_dir(),
            created_at,
            modified_at,
            extension,
        }
    }

    pub fn default() -> Self {
        FileInfo {
            name: String::new(),
            path: String::new(),
            size: 0,
            is_dir: false,
            created_at: None,
            modified_at: None,
            extension: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileTreeNode {
    pub key: String,
    pub title: String,
    pub path: String,
    pub is_leaf: bool,
    pub size: u64,
    pub children: Option<Vec<FileTreeNode>>,
    pub expandable: bool,
}

impl FileTreeNode {
    pub fn from_path(path: &std::path::Path) -> Self {
        let name = path.file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_string();

        let is_dir = path.is_dir();
        let metadata = std::fs::metadata(path).unwrap_or_default();
        
        FileTreeNode {
            key: path.to_str().unwrap_or("").to_string(),
            title: name,
            path: path.to_str().unwrap_or("").to_string(),
            is_leaf: !is_dir,
            size: metadata.len(),
            children: if is_dir {
                Some(vec![])
            } else {
                None
            },
            expandable: is_dir,
        }
    }

    pub fn new_leaf(name: String, path: String, size: u64) -> Self {
        FileTreeNode {
            key: path.clone(),
            title: name,
            path,
            is_leaf: true,
            size,
            children: None,
            expandable: false,
        }
    }

    pub fn new_dir(name: String, path: String) -> Self {
        FileTreeNode {
            key: path.clone(),
            title: name,
            path,
            is_leaf: false,
            size: 0,
            children: Some(vec![]),
            expandable: true,
        }
    }
}
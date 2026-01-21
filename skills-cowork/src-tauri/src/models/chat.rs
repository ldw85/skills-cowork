use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub content: String,
    pub role: MessageRole,
    pub timestamp: i64,
    pub attachments: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

impl ChatMessage {
    pub fn new_user(content: String) -> Self {
        ChatMessage {
            id: uuid::Uuid::new_v4().to_string(),
            content,
            role: MessageRole::User,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64,
            attachments: vec![],
        }
    }

    pub fn new_assistant(content: String) -> Self {
        ChatMessage {
            id: uuid::Uuid::new_v4().to_string(),
            content,
            role: MessageRole::Assistant,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64,
            attachments: vec![],
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatSession {
    pub id: String,
    pub name: String,
    pub messages: Vec<ChatMessage>,
    pub created_at: i64,
    pub updated_at: i64,
    pub is_active: bool,
}

impl ChatSession {
    pub fn new(name: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        ChatSession {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            messages: vec![],
            created_at: now,
            updated_at: now,
            is_active: false,
        }
    }

    pub fn add_message(&mut self, message: ChatMessage) {
        self.messages.push(message);
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
    }

    pub fn clear_messages(&mut self) {
        self.messages.clear();
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
    }
}
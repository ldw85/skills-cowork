pub mod file;
pub mod chat;
pub mod config;
pub mod response;

pub use file::*;
pub use chat::*;
pub use config::*;
pub use response::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub body: String,
}
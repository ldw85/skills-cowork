use log::{info, warn, error, debug};
use simplelog::{ConfigBuilder, LevelFilter, TermLogger, TerminalMode};

pub fn init_logger() -> Result<(), Box<dyn std::error::Error>> {
    let config = ConfigBuilder::new()
        .set_target_level(LevelFilter::Info)
        .set_location_level(LevelFilter::Debug)
        .set_time_level(LevelFilter::Debug)
        .build();

    TermLogger::init(
        LevelFilter::Info,
        config,
        TerminalMode::Mixed,
        simplelog::ColorChoice::Auto,
    )?;
    
    info!("Logger initialized successfully");
    Ok(())
}

pub fn log_info(message: &str) {
    info!("{}", message);
}

pub fn log_warn(message: &str) {
    warn!("{}", message);
}

pub fn log_error(message: &str) {
    error!("{}", message);
}

pub fn log_debug(message: &str) {
    debug!("{}", message);
}
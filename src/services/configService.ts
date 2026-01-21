import { logger } from '../utils/logger';
import { APIConfig } from '../types';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const configService = {
  async loadConfig(): Promise<APIConfig | null> {
    try {
      logger.debug('Loading config');
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const config = await invoke<APIConfig | null>('load_config');
        logger.info('Config loaded successfully', { hasConfig: !!config });
        return config;
      }
      
      // Mock: load from localStorage
      const configStr = localStorage.getItem('api_config');
      const config = configStr ? JSON.parse(configStr) : null;
      logger.info('Mock config loaded from localStorage', { hasConfig: !!config });
      return config;
    } catch (error) {
      logger.error('Failed to load config', { error });
      throw error;
    }
  },

  async saveConfig(config: APIConfig): Promise<void> {
    try {
      logger.debug('Saving config', { provider: config.provider });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('save_config', { config });
        logger.info('Config saved successfully', { provider: config.provider });
        return;
      }
      
      // Mock: save to localStorage
      localStorage.setItem('api_config', JSON.stringify(config));
      logger.info('Mock config saved to localStorage', { provider: config.provider });
    } catch (error) {
      logger.error('Failed to save config', { error });
      throw error;
    }
  },

  async getConfig(): Promise<APIConfig | null> {
    try {
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const config = await invoke<APIConfig | null>('get_config');
        return config;
      }
      
      const configStr = localStorage.getItem('api_config');
      return configStr ? JSON.parse(configStr) : null;
    } catch (error) {
      logger.error('Failed to get config', { error });
      return null;
    }
  },

  async updateApiKey(apiKey: string): Promise<void> {
    try {
      logger.debug('Updating API key');
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('update_api_key', { apiKey });
        logger.info('API key updated successfully');
        return;
      }
      
      // Mock: update in localStorage
      const configStr = localStorage.getItem('api_config');
      if (configStr) {
        const config = JSON.parse(configStr);
        config.apiKey = apiKey;
        localStorage.setItem('api_config', JSON.stringify(config));
        logger.info('Mock API key updated in localStorage');
      }
    } catch (error) {
      logger.error('Failed to update API key', { error });
      throw error;
    }
  },

  async validateConfig(config: APIConfig): Promise<boolean> {
    try {
      logger.debug('Validating config', { provider: config.provider });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const isValid = await invoke<boolean>('validate_config', { config });
        logger.info('Config validated', { provider: config.provider, isValid });
        return isValid;
      }
      
      // Mock validation
      const isValid = !!config.apiKey && config.apiKey.length > 0;
      logger.info('Mock config validation', { isValid });
      return isValid;
    } catch (error) {
      logger.error('Failed to validate config', { error });
      return false;
    }
  },
};

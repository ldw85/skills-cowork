import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { APIConfig } from '../types';
import { configService } from '../services/configService';
import { logger } from '../utils/logger';

interface ConfigState {
  apiConfig: APIConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  loadConfig: () => Promise<void>;
  saveConfig: (config: APIConfig) => Promise<void>;
  updateApiKey: (key: string) => Promise<void>;
  getApiConfig: () => APIConfig | null;
  validateConfig: (config: APIConfig) => Promise<boolean>;
  clearConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        apiConfig: null,
        isConfigured: false,
        isLoading: false,

        loadConfig: async () => {
          try {
            logger.info('Loading config');
            set({ isLoading: true }, false, 'loadConfig/start');

            const config = await configService.loadConfig();

            set(
              {
                apiConfig: config,
                isConfigured: !!config,
                isLoading: false,
              },
              false,
              'loadConfig/success'
            );

            logger.info('Config loaded successfully', { hasConfig: !!config });
          } catch (error) {
            logger.error('Failed to load config', { error });
            set({ isLoading: false }, false, 'loadConfig/error');
            throw error;
          }
        },

        saveConfig: async (config: APIConfig) => {
          try {
            logger.info('Saving config', { provider: config.provider });
            set({ isLoading: true }, false, 'saveConfig/start');

            await configService.saveConfig(config);

            set(
              {
                apiConfig: config,
                isConfigured: true,
                isLoading: false,
              },
              false,
              'saveConfig/success'
            );

            logger.info('Config saved successfully', { provider: config.provider });
          } catch (error) {
            logger.error('Failed to save config', { error });
            set({ isLoading: false }, false, 'saveConfig/error');
            throw error;
          }
        },

        updateApiKey: async (key: string) => {
          try {
            logger.info('Updating API key');
            set({ isLoading: true }, false, 'updateApiKey/start');

            await configService.updateApiKey(key);

            const { apiConfig } = get();
            if (apiConfig) {
              set(
                {
                  apiConfig: { ...apiConfig, apiKey: key },
                  isLoading: false,
                },
                false,
                'updateApiKey/success'
              );
            } else {
              set({ isLoading: false }, false, 'updateApiKey/noConfig');
            }

            logger.info('API key updated successfully');
          } catch (error) {
            logger.error('Failed to update API key', { error });
            set({ isLoading: false }, false, 'updateApiKey/error');
            throw error;
          }
        },

        getApiConfig: () => {
          return get().apiConfig;
        },

        validateConfig: async (config: APIConfig) => {
          try {
            logger.info('Validating config', { provider: config.provider });
            const isValid = await configService.validateConfig(config);
            logger.info('Config validation completed', { provider: config.provider, isValid });
            return isValid;
          } catch (error) {
            logger.error('Failed to validate config', { error });
            return false;
          }
        },

        clearConfig: () => {
          logger.info('Clearing config');
          set(
            {
              apiConfig: null,
              isConfigured: false,
            },
            false,
            'clearConfig'
          );
        },
      }),
      {
        name: 'config-storage',
        partialize: (state) => ({
          apiConfig: state.apiConfig,
          isConfigured: state.isConfigured,
        }),
      }
    ),
    { name: 'ConfigStore' }
  )
);

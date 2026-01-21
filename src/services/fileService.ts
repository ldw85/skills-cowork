import { logger } from '../utils/logger';
import { FileTreeNode } from '../types';

// Check if we're running in Tauri context
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const fileService = {
  async readFile(path: string): Promise<string> {
    try {
      logger.debug('Reading file', { path });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const content = await invoke<string>('read_file', { path });
        logger.info('File read successfully', { path });
        return content;
      }
      
      // Mock implementation for development
      logger.warn('Using mock file service');
      return `// Mock content for ${path}`;
    } catch (error) {
      logger.error('Failed to read file', { path, error });
      throw error;
    }
  },

  async writeFile(path: string, content: string): Promise<void> {
    try {
      logger.debug('Writing file', { path });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('write_file', { path, content });
        logger.info('File written successfully', { path });
        return;
      }
      
      // Mock implementation
      logger.warn('Using mock file service');
      logger.info('Mock file written', { path });
    } catch (error) {
      logger.error('Failed to write file', { path, error });
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      logger.debug('Deleting file', { path });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('delete_file', { path });
        logger.info('File deleted successfully', { path });
        return;
      }
      
      logger.warn('Using mock file service');
    } catch (error) {
      logger.error('Failed to delete file', { path, error });
      throw error;
    }
  },

  async listDirectory(path: string): Promise<FileTreeNode[]> {
    try {
      logger.debug('Listing directory', { path });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const nodes = await invoke<FileTreeNode[]>('list_directory', { path });
        logger.info('Directory listed successfully', { path, count: nodes.length });
        return nodes;
      }
      
      // Mock data
      logger.warn('Using mock file service');
      return [
        {
          key: '1',
          title: 'src',
          type: 'folder' as const,
          path: `${path}/src`,
          children: [
            {
              key: '2',
              title: 'index.ts',
              type: 'file' as const,
              path: `${path}/src/index.ts`,
            },
          ],
        },
      ];
    } catch (error) {
      logger.error('Failed to list directory', { path, error });
      throw error;
    }
  },

  async createDirectory(path: string): Promise<void> {
    try {
      logger.debug('Creating directory', { path });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('create_directory', { path });
        logger.info('Directory created successfully', { path });
        return;
      }
      
      logger.warn('Using mock file service');
    } catch (error) {
      logger.error('Failed to create directory', { path, error });
      throw error;
    }
  },

  async selectDirectory(): Promise<string | null> {
    try {
      logger.debug('Opening directory selector');
      
      if (isTauri) {
        const { open } = await import('@tauri-apps/api/dialog');
        const selected = await open({
          directory: true,
          multiple: false,
        });
        
        if (selected && typeof selected === 'string') {
          logger.info('Directory selected', { path: selected });
          return selected;
        }
        
        logger.info('Directory selection cancelled');
        return null;
      }
      
      logger.warn('Using mock file service');
      return '/mock/workspace';
    } catch (error) {
      logger.error('Failed to select directory', { error });
      throw error;
    }
  },

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      logger.debug('Renaming file', { oldPath, newPath });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('rename_file', { oldPath, newPath });
        logger.info('File renamed successfully', { oldPath, newPath });
        return;
      }
      
      logger.warn('Using mock file service');
    } catch (error) {
      logger.error('Failed to rename file', { oldPath, newPath, error });
      throw error;
    }
  },

  async fileExists(path: string): Promise<boolean> {
    try {
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        return await invoke<boolean>('file_exists', { path });
      }
      
      return true; // Mock always returns true
    } catch (error) {
      logger.error('Failed to check file existence', { path, error });
      return false;
    }
  },
};

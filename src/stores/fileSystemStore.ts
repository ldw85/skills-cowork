import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FileTreeNode } from '../types';
import { fileService } from '../services/fileService';
import { logger } from '../utils/logger';

interface FileSystemState {
  fileTree: FileTreeNode[];
  expandedKeys: string[];
  selectedKey: string | null;
  isLoading: boolean;
  loadFileTree: (path: string) => Promise<void>;
  setExpandedKeys: (keys: string[]) => void;
  setSelectedKey: (key: string | null) => void;
  createFile: (parentPath: string, fileName: string) => Promise<void>;
  createFolder: (parentPath: string, folderName: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newName: string) => Promise<void>;
  refreshTree: () => Promise<void>;
  toggleExpanded: (key: string) => void;
}

export const useFileSystemStore = create<FileSystemState>()(
  devtools(
    (set, get) => ({
      fileTree: [],
      expandedKeys: [],
      selectedKey: null,
      isLoading: false,

      loadFileTree: async (path: string) => {
        try {
          logger.info('Loading file tree', { path });
          set({ isLoading: true }, false, 'loadFileTree/start');

          const nodes = await fileService.listDirectory(path);

          set(
            {
              fileTree: nodes,
              isLoading: false,
            },
            false,
            'loadFileTree/success'
          );

          logger.info('File tree loaded successfully', { path, count: nodes.length });
        } catch (error) {
          logger.error('Failed to load file tree', { path, error });
          set({ isLoading: false }, false, 'loadFileTree/error');
          throw error;
        }
      },

      setExpandedKeys: (keys: string[]) => {
        set({ expandedKeys: keys }, false, 'setExpandedKeys');
      },

      setSelectedKey: (key: string | null) => {
        logger.debug('Setting selected key', { key });
        set({ selectedKey: key }, false, 'setSelectedKey');
      },

      createFile: async (parentPath: string, fileName: string) => {
        try {
          logger.info('Creating file', { parentPath, fileName });
          const filePath = `${parentPath}/${fileName}`;
          
          await fileService.writeFile(filePath, '');
          await get().refreshTree();

          logger.info('File created successfully', { filePath });
        } catch (error) {
          logger.error('Failed to create file', { parentPath, fileName, error });
          throw error;
        }
      },

      createFolder: async (parentPath: string, folderName: string) => {
        try {
          logger.info('Creating folder', { parentPath, folderName });
          const folderPath = `${parentPath}/${folderName}`;
          
          await fileService.createDirectory(folderPath);
          await get().refreshTree();

          logger.info('Folder created successfully', { folderPath });
        } catch (error) {
          logger.error('Failed to create folder', { parentPath, folderName, error });
          throw error;
        }
      },

      deleteFile: async (path: string) => {
        try {
          logger.info('Deleting file', { path });
          
          await fileService.deleteFile(path);
          await get().refreshTree();

          const { selectedKey } = get();
          if (selectedKey === path) {
            set({ selectedKey: null }, false, 'deleteFile/clearSelection');
          }

          logger.info('File deleted successfully', { path });
        } catch (error) {
          logger.error('Failed to delete file', { path, error });
          throw error;
        }
      },

      renameFile: async (oldPath: string, newName: string) => {
        try {
          logger.info('Renaming file', { oldPath, newName });
          const pathParts = oldPath.split('/');
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join('/');

          await fileService.renameFile(oldPath, newPath);
          await get().refreshTree();

          const { selectedKey } = get();
          if (selectedKey === oldPath) {
            set({ selectedKey: newPath }, false, 'renameFile/updateSelection');
          }

          logger.info('File renamed successfully', { oldPath, newPath });
        } catch (error) {
          logger.error('Failed to rename file', { oldPath, newName, error });
          throw error;
        }
      },

      refreshTree: async () => {
        const { fileTree } = get();
        if (fileTree.length > 0 && fileTree[0].path) {
          const rootPath = fileTree[0].path.split('/').slice(0, -1).join('/') || '/';
          await get().loadFileTree(rootPath);
        }
      },

      toggleExpanded: (key: string) => {
        const { expandedKeys } = get();
        const newExpandedKeys = expandedKeys.includes(key)
          ? expandedKeys.filter((k) => k !== key)
          : [...expandedKeys, key];

        logger.debug('Toggling expanded', { key, isExpanded: !expandedKeys.includes(key) });
        set({ expandedKeys: newExpandedKeys }, false, 'toggleExpanded');
      },
    }),
    { name: 'FileSystemStore' }
  )
);

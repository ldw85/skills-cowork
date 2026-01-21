import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorFile } from '../types';
import { fileService } from '../services/fileService';
import { logger } from '../utils/logger';

interface EditorState {
  openFiles: EditorFile[];
  activeFileId: string | null;
  openFile: (path: string) => Promise<void>;
  closeFile: (id: string) => void;
  closeAllFiles: () => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  saveFile: (id: string) => Promise<void>;
  getActiveFile: () => EditorFile | undefined;
  saveAllFiles: () => Promise<void>;
  isFileDirty: (id: string) => boolean;
}

const getFileLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    sh: 'shell',
  };
  return languageMap[ext] || 'plaintext';
};

const generateFileId = (path: string): string => {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${path}`;
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      openFiles: [],
      activeFileId: null,

      openFile: async (path: string) => {
        try {
          const { openFiles } = get();
          const existingFile = openFiles.find((f) => f.path === path);

          if (existingFile) {
            logger.info('File already open, setting as active', { path });
            set({ activeFileId: existingFile.id }, false, 'openFile/existing');
            return;
          }

          logger.info('Opening file', { path });
          const content = await fileService.readFile(path);
          const fileName = path.split('/').pop() || path;
          const language = getFileLanguage(path);

          const newFile: EditorFile = {
            id: generateFileId(path),
            path,
            name: fileName,
            content,
            isDirty: false,
            language,
          };

          set(
            {
              openFiles: [...openFiles, newFile],
              activeFileId: newFile.id,
            },
            false,
            'openFile/new'
          );

          logger.info('File opened successfully', { path, fileId: newFile.id });
        } catch (error) {
          logger.error('Failed to open file', { path, error });
          throw error;
        }
      },

      closeFile: (id: string) => {
        const { openFiles, activeFileId } = get();
        const file = openFiles.find((f) => f.id === id);

        if (file?.isDirty) {
          logger.warn('Closing dirty file', { fileId: id, path: file.path });
        }

        const newOpenFiles = openFiles.filter((f) => f.id !== id);
        let newActiveFileId = activeFileId;

        if (activeFileId === id) {
          newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null;
        }

        logger.info('Closing file', { fileId: id });
        set(
          {
            openFiles: newOpenFiles,
            activeFileId: newActiveFileId,
          },
          false,
          'closeFile'
        );
      },

      closeAllFiles: () => {
        logger.info('Closing all files');
        set({ openFiles: [], activeFileId: null }, false, 'closeAllFiles');
      },

      setActiveFile: (id: string) => {
        const { openFiles } = get();
        const file = openFiles.find((f) => f.id === id);
        
        if (file) {
          logger.debug('Setting active file', { fileId: id, path: file.path });
          set({ activeFileId: id }, false, 'setActiveFile');
        } else {
          logger.warn('Attempted to set non-existent file as active', { fileId: id });
        }
      },

      updateFileContent: (id: string, content: string) => {
        const { openFiles } = get();
        const updatedFiles = openFiles.map((file) =>
          file.id === id
            ? { ...file, content, isDirty: true }
            : file
        );

        set({ openFiles: updatedFiles }, false, 'updateFileContent');
      },

      saveFile: async (id: string) => {
        try {
          const { openFiles } = get();
          const file = openFiles.find((f) => f.id === id);

          if (!file) {
            logger.error('File not found for saving', { fileId: id });
            throw new Error('File not found');
          }

          logger.info('Saving file', { fileId: id, path: file.path });
          await fileService.writeFile(file.path, file.content);

          const updatedFiles = openFiles.map((f) =>
            f.id === id ? { ...f, isDirty: false } : f
          );

          set({ openFiles: updatedFiles }, false, 'saveFile');
          logger.info('File saved successfully', { fileId: id, path: file.path });
        } catch (error) {
          logger.error('Failed to save file', { fileId: id, error });
          throw error;
        }
      },

      saveAllFiles: async () => {
        const { openFiles } = get();
        const dirtyFiles = openFiles.filter((f) => f.isDirty);

        if (dirtyFiles.length === 0) {
          logger.info('No dirty files to save');
          return;
        }

        logger.info('Saving all dirty files', { count: dirtyFiles.length });

        const savePromises = dirtyFiles.map((file) =>
          fileService.writeFile(file.path, file.content)
            .catch((error) => {
              logger.error('Failed to save file in batch', { path: file.path, error });
              throw error;
            })
        );

        try {
          await Promise.all(savePromises);

          const updatedFiles = openFiles.map((f) => ({ ...f, isDirty: false }));
          set({ openFiles: updatedFiles }, false, 'saveAllFiles');

          logger.info('All files saved successfully');
        } catch (error) {
          logger.error('Failed to save all files', { error });
          throw error;
        }
      },

      getActiveFile: () => {
        const { openFiles, activeFileId } = get();
        return openFiles.find((f) => f.id === activeFileId);
      },

      isFileDirty: (id: string) => {
        const { openFiles } = get();
        const file = openFiles.find((f) => f.id === id);
        return file?.isDirty || false;
      },
    }),
    { name: 'EditorStore' }
  )
);

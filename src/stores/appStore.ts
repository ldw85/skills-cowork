import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '../utils/logger';

interface AppState {
  isInitialized: boolean;
  currentLanguage: 'zh-CN' | 'en-US';
  currentTheme: 'light' | 'dark';
  windowSize: { width: number; height: number };
  currentWorkspace: string;
  workspaces: string[];
  setLanguage: (lang: 'zh-CN' | 'en-US') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setInitialized: (init: boolean) => void;
  setWindowSize: (size: { width: number; height: number }) => void;
  setCurrentWorkspace: (path: string) => void;
  addWorkspace: (path: string) => void;
  removeWorkspace: (path: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        isInitialized: false,
        currentLanguage: 'zh-CN',
        currentTheme: 'light',
        windowSize: { width: 1200, height: 800 },
        currentWorkspace: '',
        workspaces: [],

        setLanguage: (lang) => {
          logger.info('Setting language', { lang });
          set({ currentLanguage: lang }, false, 'setLanguage');
        },

        setTheme: (theme) => {
          logger.info('Setting theme', { theme });
          set({ currentTheme: theme }, false, 'setTheme');
        },

        setInitialized: (init) => {
          logger.info('Setting initialized', { init });
          set({ isInitialized: init }, false, 'setInitialized');
        },

        setWindowSize: (size) => {
          set({ windowSize: size }, false, 'setWindowSize');
        },

        setCurrentWorkspace: (path) => {
          logger.info('Setting current workspace', { path });
          set({ currentWorkspace: path }, false, 'setCurrentWorkspace');
        },

        addWorkspace: (path) => {
          const { workspaces } = get();
          if (!workspaces.includes(path)) {
            logger.info('Adding workspace', { path });
            set(
              { workspaces: [...workspaces, path] },
              false,
              'addWorkspace'
            );
          }
        },

        removeWorkspace: (path) => {
          const { workspaces, currentWorkspace } = get();
          logger.info('Removing workspace', { path });
          set(
            {
              workspaces: workspaces.filter((w) => w !== path),
              currentWorkspace: currentWorkspace === path ? '' : currentWorkspace,
            },
            false,
            'removeWorkspace'
          );
        },
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          currentLanguage: state.currentLanguage,
          currentTheme: state.currentTheme,
          currentWorkspace: state.currentWorkspace,
          workspaces: state.workspaces,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

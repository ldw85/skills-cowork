import { create } from 'zustand'

interface AppState {
  // UI state
  isDarkMode: boolean
  currentFile: string
  sidebarCollapsed: boolean
  
  // Actions
  setDarkMode: (isDarkMode: boolean) => void
  setCurrentFile: (filePath: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  isDarkMode: false,
  currentFile: '',
  sidebarCollapsed: false,
  
  // Actions
  setDarkMode: (isDarkMode) => set({ isDarkMode }),
  setCurrentFile: (currentFile) => set({ currentFile }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}))
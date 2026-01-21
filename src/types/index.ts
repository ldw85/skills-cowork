// Export all types from their respective modules
export * from './chat';
export * from './editor';
export * from './file';
export * from './skills';
export * from './config';

// Legacy types for backward compatibility
export interface FileNode {
  key: string
  title: string
  isLeaf?: boolean
  children?: FileNode[]
  icon?: React.ReactNode
}

export interface EditorTab {
  key: string
  title: string
  path: string
  modified: boolean
  language: string
}

export interface Settings {
  apiProvider: string
  apiKey: string
  endpoint: string
  workspace: string
  fontSize: number
  fontFamily: string
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
}

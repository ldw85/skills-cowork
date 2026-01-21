export interface FileNode {
  key: string
  title: string
  isLeaf?: boolean
  children?: FileNode[]
  icon?: React.ReactNode
}

export interface Skill {
  id: string
  name: string
  description: string
  category?: string
  icon?: string
}

export interface SkillPack {
  id: string
  name: string
  version: string
  description: string
  skills: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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

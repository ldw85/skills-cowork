import React, { useState, useEffect } from 'react'
import { Card, Button, Space } from 'antd'
import { Editor } from '@monaco-editor/react'
import { useStore } from '@/store'
import { invoke } from '@tauri-apps/api/core'

interface CodeEditorProps {
  filePath: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath }) => {
  const { isDarkMode } = useStore()
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('typescript')

  useEffect(() => {
    loadFile()
  }, [filePath])

  const loadFile = async () => {
    try {
      const result = await invoke('read_file', { path: filePath })
      setContent(result as string)
      
      // 根据文件扩展名设置语言
      const ext = filePath.split('.').pop()
      const langMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'css': 'css',
        'html': 'html',
        'json': 'json',
        'md': 'markdown',
        'yml': 'yaml',
        'yaml': 'yaml',
      }
      setLanguage(langMap[ext || ''] || 'plaintext')
    } catch (error) {
      console.error('Failed to load file:', error)
      setContent('// Error loading file')
    }
  }

  const saveFile = async () => {
    try {
      await invoke('write_file', { 
        path: filePath, 
        content 
      })
      console.log('File saved successfully')
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  return (
    <Card 
      title={filePath}
      extra={
        <Space>
          <Button onClick={saveFile} type="primary">
            Save
          </Button>
        </Space>
      }
      style={{ height: 'calc(100vh - 120px)' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
    >
      <Editor
        height="100%"
        language={language}
        value={content}
        theme={isDarkMode ? 'vs-dark' : 'vs-light'}
        onChange={(value) => setContent(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </Card>
  )
}

export default CodeEditor
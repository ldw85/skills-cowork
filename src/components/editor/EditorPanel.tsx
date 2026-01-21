'use client'

import React, { useState, useRef } from 'react'
import { Tabs, Button, Tooltip, Spin } from 'antd'
import { CloseOutlined, MinusCircleOutlined } from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import { useTheme } from '../../contexts/ThemeContext'
import type { EditorTab } from '../../types'

interface EditorPanelProps {
  width?: string | number
  height?: string
}

export default function EditorPanel({ width = '100%', height = '100%' }: EditorPanelProps) {
  const { currentTheme } = useTheme()
  const editorRef = useRef<any>(null)
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(true)

  // Mock tabs data
  const [tabs, setTabs] = useState<EditorTab[]>([
    { key: '1', title: 'index.tsx', path: '/src/index.tsx', modified: false, language: 'typescript' },
    { key: '2', title: 'App.tsx', path: '/src/App.tsx', modified: true, language: 'typescript' },
    { key: '3', title: 'README.md', path: '/README.md', modified: false, language: 'markdown' },
  ])

  // Mock file contents
  const fileContents: Record<string, string> = {
    '1': `import React from 'react'\nimport { Button } from 'antd'\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello Skills Cowork</h1>\n      <Button type="primary">Click Me</Button>\n    </div>\n  )\n}`,
    '2': `import React, { useState } from 'react'\nimport { Layout, Menu, theme } from 'antd'\n\nconst { Header, Sider, Content } = Layout\n\nexport default function App() {\n  const [collapsed, setCollapsed] = useState(false)\n  const {\n    token: { colorBgContainer },\n  } = theme.useToken()\n\n  return (\n    <Layout style={{ minHeight: '100vh' }}>\n      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>\n        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" />\n      </Sider>\n      <Layout>\n        <Header style={{ padding: 0, background: colorBgContainer }} />\n        <Content style={{ margin: '24px 16px 0' }}>\n          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>\n            Content\n          </div>\n        </Content>\n      </Layout>\n    </Layout>\n  )\n}`,
    '3': `# Skills Cowork\n\nWelcome to Skills Cowork - your AI-powered coding assistant!\n\n## Features\n\n- **Code Generation**: Generate code snippets automatically\n- **Code Review**: Get AI-powered code reviews\n- **Documentation**: Auto-generate documentation\n- **Chat Interface**: Interactive chat with AI assistant\n\n## Getting Started\n\n1. Configure your API settings\n2. Select your skills\n3. Start coding!\n\n## License\n\nMIT License`,
  }

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor
    setLoading(false)
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const handleTabClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter(tab => tab.key !== key)
    setTabs(newTabs)
    if (activeTab === key && newTabs.length > 0) {
      setActiveTab(newTabs[0].key)
    }
  }

  const renderTabTitle = (tab: EditorTab) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {tab.modified && <MinusCircleOutlined style={{ color: '#faad14', fontSize: '12px' }} />}
      <span>{tab.title}</span>
      <Tooltip title="Close">
        <CloseOutlined
          style={{ fontSize: '12px', marginLeft: '4px' }}
          onClick={(e) => handleTabClose(tab.key, e)}
        />
      </Tooltip>
    </div>
  )

  const tabItems = tabs.map(tab => ({
    key: tab.key,
    label: renderTabTitle(tab),
    children: (
      <div style={{ height: '100%' }}>
        {loading && <Spin style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
        <Editor
          height="100%"
          defaultLanguage={tab.language}
          language={tab.language}
          value={fileContents[tab.key]}
          theme={currentTheme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            rulers: [80, 120],
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
        />
      </div>
    ),
  }))

  if (tabs.length === 0) {
    return (
      <div className="editor-panel"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#8c8c8c',
          fontSize: '14px'
        }}
      >
        No files open
      </div>
    )
  }

  return (
    <div className="editor-panel">
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={handleTabChange}
        tabBarStyle={{
          margin: 0,
          padding: '4px 8px 0 8px',
          borderBottom: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
        }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      />
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Tree, Button, Space, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useStore } from '@/store'
import { invoke } from '@tauri-apps/api/core'

interface FileNode {
  key: string
  title: string
  isLeaf: boolean
  children?: FileNode[]
}

const FileExplorer: React.FC = () => {
  const { currentFile, setCurrentFile, isDarkMode } = useStore()
  const [treeData, setTreeData] = useState<FileNode[]>([])
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    loadWorkspace()
  }, [])

  const loadWorkspace = async () => {
    try {
      const result = await invoke('list_files', { path: './' })
      setTreeData(result as FileNode[])
    } catch (error) {
      console.error('Failed to load workspace:', error)
      // 设置默认的文件树
      setTreeData([
        {
          key: 'src',
          title: 'src',
          isLeaf: false,
          children: [
            {
              key: 'src/components',
              title: 'components',
              isLeaf: false,
              children: [
                {
                  key: 'src/components/MainLayout.tsx',
                  title: 'MainLayout.tsx',
                  isLeaf: true
                },
                {
                  key: 'src/components/CodeEditor.tsx',
                  title: 'CodeEditor.tsx',
                  isLeaf: true
                }
              ]
            },
            {
              key: 'src/store',
              title: 'store',
              isLeaf: false,
              children: [
                {
                  key: 'src/store/index.ts',
                  title: 'index.ts',
                  isLeaf: true
                }
              ]
            }
          ]
        }
      ])
    }
  }

  const onSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const selectedFile = selectedKeys[0] as string
      setCurrentFile(selectedFile)
    }
  }

  const createNewFile = async () => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      try {
        await invoke('create_file', { path: fileName, content: '' })
        loadWorkspace()
      } catch (error) {
        console.error('Failed to create file:', error)
      }
    }
  }

  const createNewFolder = async () => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      try {
        await invoke('create_folder', { path: folderName })
        loadWorkspace()
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    }
  }

  const filteredTreeData = treeData.filter(node => 
    node.title.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button onClick={createNewFile} icon={<PlusOutlined />} size="small">
            New File
          </Button>
          <Button onClick={createNewFolder} icon={<PlusOutlined />} size="small">
            New Folder
          </Button>
        </Space>
        
        <Input
          placeholder="Search files..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          size="small"
        />
        
        <Tree
          showIcon
          selectedKeys={currentFile ? [currentFile] : []}
          treeData={filteredTreeData}
          onSelect={onSelect}
          height={400}
          style={{
            background: isDarkMode ? '#1f1f1f' : '#fff',
            color: isDarkMode ? '#fff' : '#000'
          }}
        />
      </Space>
    </div>
  )
}

export default FileExplorer
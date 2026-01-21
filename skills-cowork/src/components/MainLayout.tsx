import React from 'react'
import { Layout, Select, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store'
import CodeEditor from './CodeEditor'
import FileExplorer from './FileExplorer'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { currentFile, isDarkMode } = useStore()

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: isDarkMode ? '#001529' : '#fff',
        borderBottom: '1px solid #d9d9d9'
      }}>
        <div style={{ color: isDarkMode ? '#fff' : '#000', fontSize: '18px', fontWeight: 'bold' }}>
          Skills Cowork
        </div>
        <Space>
          <Select
            value={i18n.language}
            style={{ width: 120 }}
            onChange={handleLanguageChange}
            options={[
              { value: 'zh-CN', label: '中文' },
              { value: 'en', label: 'English' }
            ]}
          />
        </Space>
      </Header>
      
      <Layout>
        <Sider 
          width={250} 
          style={{ 
            background: isDarkMode ? '#1f1f1f' : '#fff',
            borderRight: '1px solid #d9d9d9'
          }}
        >
          <FileExplorer />
        </Sider>
        
        <Content style={{ padding: '16px' }}>
          {currentFile ? (
            <CodeEditor filePath={currentFile} />
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: isDarkMode ? '#ccc' : '#666'
            }}>
              {t('welcome')}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
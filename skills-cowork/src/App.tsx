import React from 'react'
import { Layout, ConfigProvider } from 'antd'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/MainLayout'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'

const App: React.FC = () => {
  const { i18n } = useTranslation()
  
  const antdLocale = i18n.language === 'zh-CN' ? zhCN : enUS

  return (
    <ConfigProvider locale={antdLocale}>
      <Layout style={{ minHeight: '100vh' }}>
        <MainLayout />
      </Layout>
    </ConfigProvider>
  )
}

export default App
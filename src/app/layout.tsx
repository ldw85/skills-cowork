import type { Metadata } from 'next'
import './globals.css'
import '../styles/components.css'
import '../styles/topbar.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ThemeProvider } from '../contexts/ThemeContext'
import I18nProvider from '../components/I18nProvider'
import { ConfigProvider } from 'antd'
import theme from 'antd'

export const metadata: Metadata = {
  title: 'Skills Cowork',
  description: 'AI-powered coding assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <I18nProvider>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 6,
                  },
                }}
              >
                {children}
              </ConfigProvider>
            </I18nProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}

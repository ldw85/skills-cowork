'use client'

import React from 'react'
import { Button, Card, Row, Col, Typography } from 'antd'
import { RocketOutlined, CodeOutlined, MessageOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter } from 'next/navigation'

const { Title, Paragraph, Text } = Typography

interface WelcomePageProps {
  onStart: () => void
  onSkip: () => void
}

export default function WelcomePage({ onStart, onSkip }: WelcomePageProps) {
  const { t } = useTranslation()
  const { currentTheme } = useTheme()

  const features = [
    {
      icon: <CodeOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: '智能代码编辑',
      description: '集成Monaco编辑器，支持语法高亮、智能补全和代码片段',
    },
    {
      icon: <MessageOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'AI助手聊天',
      description: '实时与AI助手对话，获取代码建议和问题解答',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      title: '技能管理',
      description: '管理和配置各种AI技能，提升开发效率',
    },
  ]

  return (
    <div className="welcome-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      background: currentTheme === 'dark' ? '#000000' : '#f0f2f5',
    }}>
      <Card
        style={{
          maxWidth: '900px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ marginBottom: '24px' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#1890ff"/>
              <path d="M6 8h12M6 12h9M6 16h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <Title level={1} style={{ marginBottom: '12px', color: currentTheme === 'dark' ? '#ffffff' : '#262626' }}>
            {t('welcome')}
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#8c8c8c' }}>
            专业的AI辅助编程环境，提升您的开发效率
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                style={{
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
                  background: currentTheme === 'dark' ? '#141414' : '#ffffff',
                  transition: 'all 0.3s ease',
                }}
                hoverable
              >
                <div style={{ marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <Title level={5} style={{ marginBottom: '12px', color: currentTheme === 'dark' ? '#ffffff' : '#262626' }}>
                  {feature.title}
                </Title>
                <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                  {feature.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={onStart}
            style={{ minWidth: '160px', marginRight: '12px', height: '44px', fontSize: '16px' }}
          >
            {t('startConfig')}
          </Button>
          <Button
            size="large"
            onClick={onSkip}
            style={{ minWidth: '160px', height: '44px', fontSize: '16px' }}
          >
            {t('skip')}
          </Button>
        </div>
      </Card>

      <style jsx>{`
        .welcome-page .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  )
}

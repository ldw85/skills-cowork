'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Button, Card, Typography, message, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import type { Settings } from '../../types'

const { Title, Text } = Typography

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { currentTheme, setTheme } = useTheme()
  const [form] = Form.useForm<Settings>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      form.setFieldsValue(settings)
      setTheme(settings.theme || 'light')
    }
  }, [form, setTheme])

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      localStorage.setItem('settings', JSON.stringify(values))
      setTheme(values.theme)
      message.success('Settings saved successfully')
      router.push('/')
    } catch (error) {
      message.error('Please fill in all required fields')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      background: currentTheme === 'dark' ? '#000000' : '#f0f2f5',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            style={{ marginRight: '12px' }}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {t('settings')}
          </Title>
        </div>

        <Card style={{ borderRadius: '12px', background: currentTheme === 'dark' ? '#141414' : '#ffffff' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              apiProvider: 'openai',
              apiKey: '',
              endpoint: 'https://api.openai.com/v1',
              workspace: '/home/engine/project',
              fontSize: 14,
              fontFamily: 'Monaco',
              theme: 'light',
              language: 'zh-CN',
            }}
          >
            {/* API Settings */}
            <Title level={4} style={{ marginBottom: '24px', color: '#1890ff' }}>
              {t('apiSettings')}
            </Title>

            <Form.Item
              name="apiProvider"
              label={t('provider')}
              rules={[{ required: true, message: 'Please select a provider' }]}
            >
              <Select placeholder="Select API provider" size="large">
                <Select.Option value="openai">OpenAI</Select.Option>
                <Select.Option value="anthropic">Anthropic</Select.Option>
                <Select.Option value="azure">Azure OpenAI</Select.Option>
                <Select.Option value="custom">Custom</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="apiKey"
              label={t('apiKey')}
              rules={[{ required: true, message: 'Please enter your API key' }]}
            >
              <Input.Password placeholder="sk-..." size="large" />
            </Form.Item>

            <Form.Item
              name="endpoint"
              label={t('endpoint')}
              rules={[{ required: true, message: 'Please enter the endpoint' }]}
              tooltip="The API endpoint URL"
            >
              <Input placeholder="https://api.openai.com/v1" size="large" />
            </Form.Item>

            <Form.Item
              name="workspace"
              label={t('workspace')}
              rules={[{ required: true, message: 'Please enter the workspace path' }]}
              tooltip="Path to your working directory"
            >
              <Input placeholder="/path/to/workspace" size="large" />
            </Form.Item>

            {/* Font Settings */}
            <Title level={4} style={{ marginTop: '32px', marginBottom: '24px', color: '#1890ff' }}>
              {t('fontSettings')}
            </Title>

            <Form.Item
              name="fontSize"
              label={t('fontSize')}
              rules={[{ type: 'number', min: 10, max: 24, message: 'Font size must be between 10 and 24' }]}
            >
              <InputNumber min={10} max={24} style={{ width: '100%' }} size="large" />
            </Form.Item>

            <Form.Item
              name="fontFamily"
              label={t('fontFamily')}
            >
              <Select placeholder="Select font family" size="large">
                <Select.Option value="Monaco">Monaco</Select.Option>
                <Select.Option value="Fira Code">Fira Code</Select.Option>
                <Select.Option value="Consolas">Consolas</Select.Option>
                <Select.Option value="Courier New">Courier New</Select.Option>
              </Select>
            </Form.Item>

            {/* Theme & Language */}
            <Title level={4} style={{ marginTop: '32px', marginBottom: '24px', color: '#1890ff' }}>
              {t('theme')} & {t('language')}
            </Title>

            <Form.Item
              name="theme"
              label={t('theme')}
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="light">{t('light')}</Select.Option>
                <Select.Option value="dark">{t('dark')}</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label={t('language')}
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="en-US">English</Select.Option>
              </Select>
            </Form.Item>

            {/* Actions */}
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}` }}>
              <Space size="middle">
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                >
                  {t('save')}
                </Button>
                <Button
                  size="large"
                  onClick={handleCancel}
                >
                  {t('cancel')}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary">
            Skills Cowork v1.0.0
          </Text>
        </div>
      </div>
    </div>
  )
}

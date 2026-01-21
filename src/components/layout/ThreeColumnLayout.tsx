'use client'

import React, { useState } from 'react'
import { Modal, Form, Select, Input, InputNumber } from 'antd'
import Sidebar from '../sidebar/Sidebar'
import EditorPanel from '../editor/EditorPanel'
import ChatPanel from '../chat/ChatPanel'
import TopBar from './TopBar'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import type { Settings } from '../../types'

export default function ThreeColumnLayout() {
  const { currentTheme } = useTheme()
  const { t } = useTranslation()
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [form] = Form.useForm<Settings>()

  const handleSettingsClick = () => {
    setSettingsModalVisible(true)
  }

  const handleSettingsOk = () => {
    form.validateFields().then(values => {
      console.log('Settings saved:', values)
      setSettingsModalVisible(false)
    })
  }

  const handleSettingsCancel = () => {
    setSettingsModalVisible(false)
  }

  return (
    <div className="main-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-theme={currentTheme}>
      <TopBar onSettingsClick={handleSettingsClick} />
      
      <div className="content-area" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{ width: '220px', height: '100%', borderRight: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}` }}>
          <Sidebar />
        </div>

        {/* Center Editor */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <EditorPanel />
        </div>

        {/* Right Chat Panel */}
        <div style={{ width: '400px', height: '100%', borderLeft: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}` }}>
          <ChatPanel />
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        title={t('settings')}
        open={settingsModalVisible}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
        width={600}
        okText={t('save')}
        cancelText={t('cancel')}
      >
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
            theme: currentTheme,
            language: 'zh-CN',
          }}
        >
          <Form.Item
            label={t('apiSettings')}
            style={{ marginBottom: 0, fontWeight: 600 }}
          />
          
          <Form.Item
            name="apiProvider"
            label={t('provider')}
            rules={[{ required: true, message: 'Please select a provider' }]}
          >
            <Select>
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
            <Input.Password placeholder="sk-..." />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label={t('endpoint')}
            rules={[{ required: true, message: 'Please enter the endpoint' }]}
          >
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>

          <Form.Item
            name="workspace"
            label={t('workspace')}
            rules={[{ required: true, message: 'Please enter the workspace path' }]}
          >
            <Input placeholder="/path/to/workspace" />
          </Form.Item>

          <Form.Item
            label={t('fontSettings')}
            style={{ marginBottom: 0, fontWeight: 600 }}
          />

          <Form.Item
            name="fontSize"
            label={t('fontSize')}
          >
            <InputNumber min={10} max={24} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fontFamily"
            label={t('fontFamily')}
          >
            <Select>
              <Select.Option value="Monaco">Monaco</Select.Option>
              <Select.Option value="Fira Code">Fira Code</Select.Option>
              <Select.Option value="Consolas">Consolas</Select.Option>
              <Select.Option value="Courier New">Courier New</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

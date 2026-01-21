'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, Dropdown, Space, message, Empty } from 'antd'
import { SendOutlined, PlusOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import type { ChatMessage } from '../../types'

const { TextArea } = Input

interface ChatPanelProps {
  width?: string | number
  height?: string
}

export default function ChatPanel({ width = '400px', height = '100%' }: ChatPanelProps) {
  const { t } = useTranslation()
  const { currentTheme } = useTheme()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputHeight, setInputHeight] = useState(44)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('Please enter a message')
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setInputHeight(44)
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your request. Let me help you with that code. Here\'s what I suggest:\n\n```typescript\nconst example = "Hello World";\nconsole.log(example);\n```\n\nDoes this help?',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSend()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Auto-resize textarea
    const lines = value.split('\n').length
    const newHeight = Math.min(Math.max(44, lines * 22), 200)
    setInputHeight(newHeight)
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! I\'m your AI coding assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ])
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! I\'m your AI coding assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ])
  }

  const chatHistoryItems = [
    {
      key: '1',
      label: 'Chat History 1',
    },
    {
      key: '2',
      label: 'Chat History 2',
    },
    {
      key: '3',
      label: 'Chat History 3',
    },
  ]

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user'
    const bgColor = isUser 
      ? (currentTheme === 'dark' ? '#177ddc' : '#1890ff') 
      : (currentTheme === 'dark' ? '#262626' : '#f5f5f5')
    const textColor = isUser ? '#ffffff' : (currentTheme === 'dark' ? '#d9d9d9' : '#262626')
    const align = isUser ? 'flex-end' : 'flex-start'

    // Simple code block highlighting
    const formatContent = (content: string) => {
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      return content.split(codeBlockRegex).map((part, index) => {
        if (index % 3 === 2) {
          return (
            <pre
              key={index}
              style={{
                background: currentTheme === 'dark' ? '#1f1f1f' : '#f6f8fa',
                padding: '12px',
                borderRadius: '6px',
                overflowX: 'auto',
                margin: '8px 0',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: `1px solid ${currentTheme === 'dark' ? '#303030' : '#e1e4e8'}`,
              }}
            >
              {part}
            </pre>
          )
        }
        return <span key={index}>{part}</span>
      })
    }

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: align,
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            maxWidth: '85%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: bgColor,
            color: textColor,
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
            {isUser ? t('userMessage') : t('aiMessage')}
          </div>
          <div style={{ wordBreak: 'break-word' }}>
            {formatContent(msg.content)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-panel">
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
        }}
      >
        <Dropdown menu={{ items: chatHistoryItems }} placement="bottomLeft">
          <Button type="text" icon={<PlusOutlined />}>
            {t('newChat')}
          </Button>
        </Dropdown>
        
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={handleClearChat}
          style={{ color: '#ff4d4f' }}
        >
          {t('clearChat')}
        </Button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <Empty description="No messages" style={{ marginTop: '60px' }} />
        ) : (
          <>
            {messages.map(renderMessage)}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: currentTheme === 'dark' ? '#262626' : '#f5f5f5',
                    color: currentTheme === 'dark' ? '#d9d9d9' : '#262626',
                    fontSize: '13px',
                  }}
                >
                  {t('typing')}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <Space.Compact style={{ width: '100%', display: 'flex' }}>
          <Button
            icon={<PaperClipOutlined />}
            style={{ display: 'flex', alignItems: 'center' }}
          />
          <TextArea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            autoSize={false}
            style={{
              flex: 1,
              resize: 'none',
              height: `${inputHeight}px`,
              maxHeight: '200px',
              borderRadius: 0,
            }}
            rows={1}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            style={{ display: 'flex', alignItems: 'center', height: `${inputHeight}px` }}
          >
            {t('sendMessage')}
          </Button>
        </Space.Compact>
        <div className="chat-input-hint">
          Press Ctrl+Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

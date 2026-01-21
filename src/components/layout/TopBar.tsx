'use client'

import React from 'react'
import { Dropdown, Space, Button, Tooltip } from 'antd'
import { SettingOutlined, TranslationOutlined, MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'

interface TopBarProps {
  onSettingsClick: () => void
}

export default function TopBar({ onSettingsClick }: TopBarProps) {
  const { t } = useTranslation()
  const { currentTheme, toggleTheme } = useTheme()
  const { i18n } = useTranslation()

  const languageItems = [
    {
      key: 'zh-CN',
      label: '简体中文',
    },
    {
      key: 'en-US',
      label: 'English',
    },
  ]

  const handleLanguageChange = ({ key }: { key: string }) => {
    i18n.changeLanguage(key)
    localStorage.setItem('language', key)
  }

  const themeItems = [
    {
      key: 'light',
      label: t('light'),
    },
    {
      key: 'dark',
      label: t('dark'),
    },
  ]

  const handleThemeChange = ({ key }: { key: string }) => {
    if (key === 'light' || key === 'dark') {
      toggleTheme()
    }
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <Space size={12}>
          <div className="app-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#1890ff"/>
              <path d="M7 8h10M7 12h7M7 16h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="app-title">{t('appName')}</span>
        </Space>
      </div>
      
      <div className="top-bar-center">
        <Dropdown menu={{ items: languageItems, onClick: handleLanguageChange }} placement="bottom">
          <Button type="text" icon={<TranslationOutlined />}>
            {t('language')}
          </Button>
        </Dropdown>
        
        <Dropdown menu={{ items: themeItems, onClick: handleThemeChange }} placement="bottom">
          <Button type="text">
            {currentTheme === 'light' ? t('light') : t('dark')}
          </Button>
        </Dropdown>
        
        <Button type="text" icon={<SettingOutlined />} onClick={onSettingsClick}>
          {t('settings')}
        </Button>
      </div>
      
      <div className="top-bar-right">
        <Space size={4}>
          <Tooltip title={t('minimize')}>
            <Button type="text" icon={<MinusOutlined />} size="small" />
          </Tooltip>
          <Tooltip title={t('maximize')}>
            <Button type="text" icon={<BorderOutlined />} size="small" />
          </Tooltip>
          <Tooltip title={t('close')}>
            <Button type="text" icon={<CloseOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      </div>
    </div>
  )
}

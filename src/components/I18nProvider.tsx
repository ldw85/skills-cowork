'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import enUS from '../../public/locales/en-US/common.json'
import zhCN from '../../public/locales/zh-CN/common.json'

const resources = {
  'en-US': {
    translation: enUS,
  },
  'zh-CN': {
    translation: zhCN,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
  })

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh-CN'
    i18n.changeLanguage(savedLanguage)
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  zh: {
    translation: {
      welcome: '欢迎使用 Skills Cowork',
      start: '开始使用',
      language: '语言',
    }
  },
  en: {
    translation: {
      welcome: 'Welcome to Skills Cowork',
      start: 'Get Started',
      language: 'Language',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
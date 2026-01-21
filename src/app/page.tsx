'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ThreeColumnLayout = dynamic(() => import('../components/layout/ThreeColumnLayout'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>,
})

const WelcomePage = dynamic(() => import('../components/common/WelcomePage'), {
  ssr: false,
})

export default function HomePage() {
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setShowWelcome(true)
    }
  }, [])

  const handleStartConfig = () => {
    localStorage.setItem('hasVisited', 'true')
    setShowWelcome(false)
    router.push('/settings')
  }

  const handleSkip = () => {
    localStorage.setItem('hasVisited', 'true')
    setShowWelcome(false)
  }

  if (showWelcome) {
    return <WelcomePage onStart={handleStartConfig} onSkip={handleSkip} />
  }

  return <ThreeColumnLayout />
}

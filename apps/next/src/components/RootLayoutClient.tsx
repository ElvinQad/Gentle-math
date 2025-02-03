'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { MainNav } from '@/components/navigation/MainNav'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/providers/AuthProvider'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const { locale } = useTranslation()

  // Update html lang attribute
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale])

  return (
    <Provider store={store}>
      {!isDashboard && <MainNav />}
      <main className="min-h-screen bg-background">
        {children}
      </main>
    </Provider>
  )
} 
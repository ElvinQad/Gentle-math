'use client'

import { MainNav } from '@/components/navigation/MainNav'
import { BottomNav } from '@/components/navigation/BottomNav'
import { usePathname } from 'next/navigation'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useEffect } from 'react'

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
      <main className="min-h-screen bg-background pb-16 md:pb-0">
          {children}
      </main>
      {!isDashboard && <BottomNav />}
    </Provider>
  )
} 
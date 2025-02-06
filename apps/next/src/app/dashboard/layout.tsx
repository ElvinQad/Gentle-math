'use client'

import { DashboardNav, ModalContext } from '@/components/navigation/DashboardNav'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ModalContext.Provider value={{ isModalOpen, setIsModalOpen }}>
        <div className="flex min-h-screen bg-background">
          <DashboardNav />
          <main className="flex-1 pl-0 md:pl-20 transition-all duration-300 ease-in-out relative z-0 pb-20 md:pb-0">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <PageTransition>
                  {children}
                </PageTransition>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </ModalContext.Provider>
    </ThemeProvider>
  )
}
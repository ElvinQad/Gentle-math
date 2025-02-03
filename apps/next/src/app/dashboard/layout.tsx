import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-background">
        <DashboardNav />
        <main className="flex-1 pl-20 transition-all duration-300 ease-in-out relative z-0">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <PageTransition>
                {children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
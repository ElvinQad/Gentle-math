'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { MainNav } from '@/components/navigation/MainNav'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {!isDashboard && <MainNav />}
            <main className="min-h-screen bg-background">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
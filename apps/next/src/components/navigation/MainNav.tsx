'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { AuthModals } from '@/components/auth/AuthModals'
import { useTranslation } from '@/lib/i18n'

const getNavItems = (t: (key: string) => string) => [
  { href: '/dashboard', label: t('common.dashboard'), requiresAuth: true },
  { href: '/trends', label: t('common.trends'), requiresAuth: false },
  { href: '/about', label: t('common.about'), requiresAuth: false },
]

export function MainNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { data: session } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const { t } = useTranslation()
  const navItems = getNavItems(t)

  const handleAuthClick = (e: React.MouseEvent<HTMLAnchorElement>, requiresAuth: boolean) => {
    if (requiresAuth && !session) {
      e.preventDefault()
      setIsLoginOpen(true)
    }
  }

  return (
    <>
      <nav className={`w-full fixed top-0 z-50 transition-all duration-500 ${
        isHome 
          ? 'bg-transparent hover:bg-black/20 backdrop-blur-sm' 
          : 'bg-background/80 border-b border-border backdrop-blur-md shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link 
                href="/" 
                className={`text-2xl font-bold transition-all duration-300 hover:scale-105 ${
                  isHome 
                    ? 'text-white drop-shadow-md' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Gentle-math
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {navItems.map(({ href, label, requiresAuth }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => handleAuthClick(e, requiresAuth)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : isHome
                      ? 'text-white hover:bg-white/10'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </Link>
              ))}
              
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {t('common.logout')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    {t('common.login')}
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {t('common.register')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModals
        isLoginOpen={isLoginOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        isRegisterOpen={isRegisterOpen}
        onRegisterClose={() => setIsRegisterOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
      />
    </>
  )
}
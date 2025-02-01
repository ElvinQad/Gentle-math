'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { AuthModals } from '@/components/auth/AuthModals'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/trends', label: 'Trends', requiresAuth: false },
  { href: '/about', label: 'About', requiresAuth: false },
]

export function MainNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { data: session } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

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
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isHome
                      ? 'text-white hover:text-white hover:bg-white/20 backdrop-blur-sm shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  } ${
                    pathname === href && !isHome
                      ? 'bg-accent text-foreground shadow-sm'
                      : ''
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className={`ml-4 p-1 rounded-lg ${isHome ? 'bg-white/10 backdrop-blur-sm' : ''}`}>
                <ThemeToggle />
              </div>

              {session ? (
                <Link
                  href="/dashboard/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
                    isHome
                      ? 'text-white hover:bg-white/20'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {session.user?.name?.[0] || session.user?.email?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium">
                    {session.user?.name?.split(' ')[0] || 'User'}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isHome
                      ? 'text-white hover:text-white hover:bg-white/20 backdrop-blur-sm shadow-sm'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
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
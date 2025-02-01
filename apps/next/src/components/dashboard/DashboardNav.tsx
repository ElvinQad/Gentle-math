'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useState } from 'react'

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    title: 'Trends',
    href: '/dashboard/trends',
    icon: TrendingUpIcon,
  },
  {
    title: 'Predictions',
    href: '/dashboard/predictions',
    icon: ChartIcon,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <nav 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed top-0 left-0 h-screen border-r border-border bg-card flex flex-col z-30
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64 shadow-lg' : 'w-20'}`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-border overflow-hidden whitespace-nowrap ${isExpanded ? '' : 'text-center'}`}>
        <Link 
          href="/" 
          className="text-2xl font-bold transition-all duration-300 hover:scale-105 text-foreground hover:text-primary"
        >
          {isExpanded ? 'Gentle-math' : 'G'}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 py-6 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg mb-1 transition-colors group relative
                ${pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 transition-all duration-300 ${
                isExpanded 
                  ? 'opacity-100 relative' 
                  : 'opacity-0 absolute pointer-events-none'
              }`}>
                {item.title}
              </span>
              {!isExpanded && (
                <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* User Profile & Settings */}
      <div className={`p-4 border-t border-border space-y-4 ${isExpanded ? '' : 'items-center'}`}>
        {/* Theme Toggle */}
        <div className={`px-3 py-2 rounded-lg hover:bg-accent transition-colors ${isExpanded ? '' : 'text-center'}`}>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <div className="px-3 py-2 space-y-3">
          <Link
            href="/dashboard/profile"
            className={`flex items-center w-full rounded-lg transition-colors hover:bg-accent group relative ${isExpanded ? 'space-x-3' : 'justify-center'} ${
              pathname === '/dashboard/profile' ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary flex-shrink-0">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              isExpanded 
                ? 'opacity-100 relative' 
                : 'opacity-0 absolute pointer-events-none'
            }`}>
              <p className="text-sm font-medium text-foreground truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
            {!isExpanded && (
              <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                View Profile
              </div>
            )}
          </Link>
          <button
            onClick={() => signOut()}
            className={`flex items-center px-3 py-2 rounded-lg text-sm text-muted-foreground 
              hover:bg-destructive/10 hover:text-destructive transition-colors w-full
              ${isExpanded ? '' : 'justify-center'} group relative`}
          >
            <LogOutIcon className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-2 transition-all duration-300 ${
              isExpanded 
                ? 'opacity-100 relative' 
                : 'opacity-0 absolute pointer-events-none'
            }`}>
              Sign out
            </span>
            {!isExpanded && (
              <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                Sign out
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
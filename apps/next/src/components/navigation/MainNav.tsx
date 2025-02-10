'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthModals } from '@/components/auth/AuthModals';
import { useTranslation } from '@/lib/i18n';

export function MainNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { t } = useTranslation();
  const isHome = pathname === '/';

  const navItems = [
    { href: '/', label: t('common.home'), requiresAuth: false },
    { href: '/trends', label: t('common.trends'), requiresAuth: false },
    { href: '/about', label: t('common.about'), requiresAuth: false },
  ];

  const handleAuthClick = (e: React.MouseEvent<HTMLAnchorElement>, requiresAuth: boolean) => {
    if (requiresAuth && !session) {
      e.preventDefault();
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isHome ? 'bg-transparent' : 'bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4 md:py-6">
            <Link href="/" className="text-2xl font-bold">
              <span 
                className={
                  isHome 
                    ? 'text-white font-bold' 
                    : 'text-[hsl(var(--foreground))] font-bold'
                }
              >
                Gentle-math
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map(({ href, label, requiresAuth }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => handleAuthClick(e, requiresAuth)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]'
                      : isHome
                        ? 'text-white hover:bg-white/10'
                        : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {session ? (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  {t('common.logout')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    {t('common.login')}
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/0.9] transition-colors"
                  >
                    {t('common.register')}
                  </button>
                </>
              )}
            </nav>

            {/* Mobile auth buttons */}
            <div className="flex md:hidden items-center space-x-2">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/0.9] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
}

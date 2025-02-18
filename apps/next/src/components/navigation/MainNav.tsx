'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AuthModals } from '@/components/auth/AuthModals';
import { useTranslation } from '@/lib/i18n';

export function MainNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHome
            ? 'bg-[color:var(--background)]/95 backdrop-blur-md border-b border-[color:var(--border)] shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4 md:py-6">
            <Link 
              href="/" 
              className={`text-2xl font-bold transition-colors duration-300 ${
                isHome && !isScrolled
                  ? 'text-[color:var(--color-white)]'
                  : 'text-[color:var(--foreground)]'
              }`}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-soft-blue)] to-[color:var(--color-teal)]">
                Gentlemath
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map(({ href, label, requiresAuth }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => handleAuthClick(e, requiresAuth)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    pathname === href
                      ? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)]'
                      : isHome && !isScrolled
                        ? 'text-[color:var(--color-white)] hover:bg-[color:var(--color-white)]/10'
                        : 'text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10'
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="h-6 w-px bg-[color:var(--border)] mx-2" />

              {session ? (
                <button
                  onClick={() => signOut()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isHome && !isScrolled
                      ? 'text-[color:var(--color-white)] hover:bg-[color:var(--color-white)]/10'
                      : 'text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10'
                  }`}
                >
                  {t('common.logout')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isHome && !isScrolled
                        ? 'text-[color:var(--color-white)] hover:bg-[color:var(--color-white)]/10'
                        : 'text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10'
                    }`}
                  >
                    {t('common.login')}
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="group relative overflow-hidden px-4 py-2 rounded-md text-sm font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <span className="relative z-10">{t('common.register')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-soft-blue)] to-[color:var(--color-teal)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md transition-colors duration-300"
            >
              <div className="relative w-6 h-5">
                <span
                  className={`absolute w-6 h-0.5 transform transition-all duration-300 ${
                    isHome && !isScrolled ? 'bg-[color:var(--color-white)]' : 'bg-[color:var(--foreground)]'
                  } ${isMobileMenuOpen ? 'rotate-45 top-2' : 'rotate-0 top-0'}`}
                />
                <span
                  className={`absolute w-6 h-0.5 top-2 transform transition-all duration-300 ${
                    isHome && !isScrolled ? 'bg-[color:var(--color-white)]' : 'bg-[color:var(--foreground)]'
                  } ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`absolute w-6 h-0.5 transform transition-all duration-300 ${
                    isHome && !isScrolled ? 'bg-[color:var(--color-white)]' : 'bg-[color:var(--foreground)]'
                  } ${isMobileMenuOpen ? '-rotate-45 top-2' : 'rotate-0 top-4'}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-screen opacity-100 visible'
              : 'max-h-0 opacity-0 invisible'
          }`}
        >
          <div className="px-4 py-2 space-y-1 bg-[color:var(--background)] border-t border-[color:var(--border)]">
            {navItems.map(({ href, label, requiresAuth }) => (
              <Link
                key={href}
                href={href}
                onClick={(e) => {
                  handleAuthClick(e, requiresAuth);
                  setIsMobileMenuOpen(false);
                }}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)]'
                    : 'text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10'
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="h-px bg-[color:var(--border)] my-2" />

            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10 transition-colors"
              >
                {t('common.logout')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10 transition-colors"
                >
                  {t('common.login')}
                </button>
                <button
                  onClick={() => {
                    setIsRegisterOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-md text-sm font-medium bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 transition-colors"
                >
                  {t('common.register')}
                </button>
              </>
            )}
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

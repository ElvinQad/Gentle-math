'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { isUserAdmin } from '@/lib/user-helpers';

// Create a context to manage modal state
import { createContext, useContext } from 'react';

export const ModalContext = createContext<{
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}>({
  isModalOpen: false,
  setIsModalOpen: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

const navItems = [
  {
    title: 'Tends',
    href: '/dashboard',
    icon: TrendingUpIcon,
    adminOnly: false,
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: ShieldIcon,
    adminOnly: true,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isModalOpen } = useModal();
  const isAdmin = session?.user && isUserAdmin(session.user);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add this helper function to check if a path is active
  const isPathActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/trends';
    }
    return pathname === path;
  };

  if (isMobile) {
    if (isModalOpen) return null; // Hide navigation when modal is open

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
        <div className="flex justify-around items-center h-16">
          {/* Profile Link */}
          <Link
            href="/dashboard/profile"
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors
              ${
                pathname === '/dashboard/profile'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
            </div>
            <span className="text-xs mt-1">Profile</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center px-3 py-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="text-xs mt-1">Sign out</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed top-0 left-0 h-screen border-r border-border bg-card flex flex-col z-30
        transition-all duration-300 ease-in-out hidden md:flex
        ${isExpanded ? 'w-64 shadow-lg' : 'w-20'}`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b border-border overflow-hidden whitespace-nowrap ${isExpanded ? '' : 'text-center'}`}
      >
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
          {navItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.adminOnly && !isAdmin) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg mb-1 transition-colors group relative
                  ${
                    isPathActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
              >
                {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                <span
                  className={`ml-3 transition-all duration-300 ${
                    isExpanded ? 'opacity-100 relative' : 'opacity-0 absolute pointer-events-none'
                  }`}
                >
                  {item.title}
                </span>
                {!isExpanded && (
                  <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile & Settings */}
      <div className={`p-4 border-t border-border space-y-4 ${isExpanded ? '' : 'items-center'}`}>
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
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                isExpanded ? 'opacity-100 relative' : 'opacity-0 absolute pointer-events-none'
              }`}
            >
              <p className="text-sm font-medium text-foreground truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
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
            <span
              className={`ml-2 transition-all duration-300 ${
                isExpanded ? 'opacity-100 relative' : 'opacity-0 absolute pointer-events-none'
              }`}
            >
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
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

'use client';

import { DashboardNav, ModalContext } from '@/components/navigation/DashboardNav';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { PageTransition } from '@/components/animations/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ModalContext.Provider value={{ isModalOpen, setIsModalOpen }}>
        <div className="flex min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
          <DashboardNav />
          <main className="flex-1 pl-0 md:pl-20 transition-all duration-700 ease-out-expo relative z-0 pb-20 md:pb-0">
            <div className="container p-4 md:p-8 transition-all duration-500 ease-out-expo">
              <div 
                className="rounded-lg bg-[color:var(--card)] shadow-sm border border-[color:var(--border)] p-6 
                  transition-all duration-500 ease-out-expo transform hover:shadow-lg 
                  hover:shadow-[color:var(--primary)]/5"
              >
                <AnimatePresence mode="wait">
                  <PageTransition>{children}</PageTransition>
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
      </ModalContext.Provider>
    </ThemeProvider>
  );
}

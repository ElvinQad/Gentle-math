import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'sonner';
import './globals.css';
import { RootLayoutClient } from '@/components/RootLayoutClient';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fashion Trends Analysis',
  description: 'AI-powered fashion trends analysis platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RootLayoutClient>{children}</RootLayoutClient>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css'
import { RootLayoutClient } from '@/components/RootLayoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fashion Trends Analysis',
  description: 'AI-powered fashion trends analysis platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootLayoutClient>{children}</RootLayoutClient>
}
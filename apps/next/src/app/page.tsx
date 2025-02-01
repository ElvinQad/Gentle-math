'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AuthModals } from '@/components/auth/AuthModals'

export default function LandingPage() {
  const { data: session } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault()
      setIsLoginOpen(true)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 z-10" />
        <div className="absolute inset-0">
          <Image
            src="/bg.avif"
            alt="Fashion background"
            fill
            className="object-cover transform scale-105 animate-[slowZoom_20s_ease-in-out_infinite]"
            priority
          />
        </div>
        
        <div className="relative z-20 max-w-5xl mx-auto px-6">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Fashion
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Trend Analysis
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl animate-slide-up">
              Discover emerging trends, analyze color patterns, and predict fashion movements with our advanced AI platform.
            </p>
            <div className="space-x-4 animate-slide-up">
              <Link 
                href="/trends" 
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Get Started
              </Link>
              <Link 
                href="/about" 
                className="inline-block text-white border-2 border-white/80 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-20 text-foreground">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-card p-8 rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Real-time Analysis</h3>
              <p className="text-muted-foreground">
                Get instant insights into emerging fashion trends and market movements.
              </p>
            </div>
            <div className="group bg-card p-8 rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Predictive Analytics</h3>
              <p className="text-muted-foreground">
                Forecast future trends with our advanced machine learning models.
              </p>
            </div>
            <div className="group bg-card p-8 rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Market Insights</h3>
              <p className="text-muted-foreground">
                Deep dive into market segments and consumer behavior patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  )
}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AuthModals } from '@/components/auth/AuthModals';
import { useTranslation } from '@/lib/i18n';

export default function LandingPage() {
  const { data: session } = useSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { t } = useTranslation();

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault();
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-lavender)]/30 via-[color:var(--color-soft-blue)]/20 to-[color:var(--color-teal)]/30" />

        {/* Content container */}
        <div className="relative z-30 max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[color:var(--foreground)] leading-tight">
                {t('landing.hero.title')}
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-soft-blue)] via-[color:var(--color-teal)] to-[color:var(--color-lavender)]">
                  {t('landing.hero.subtitle')}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[color:var(--foreground)]/90 max-w-2xl animate-slide-up delay-100">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
                <Link
                  href={session ? '/dashboard' : '/trends'}
                  className="group relative overflow-hidden w-full sm:w-auto text-center inline-block bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-8 py-4 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  onClick={!session ? handleGetStarted : undefined}
                >
                  <span className="relative z-10">
                    {session ? t('common.dashboard') : t('common.getStarted')}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-soft-blue)] to-[color:var(--color-teal)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  href="/about"
                  className="group w-full sm:w-auto text-center inline-block border-2 border-[color:var(--border)] px-8 py-[14px] rounded-lg font-semibold transition-all duration-300 hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)] hover:scale-[1.02]"
                >
                  {t('common.learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce-slow">
          <svg
            className="w-6 h-6 text-[color:var(--foreground)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section className="py-32 bg-[color:var(--background)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-soft-blue)] to-[color:var(--color-teal)]">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-[color:var(--muted-foreground)]">
              {t('landing.features.description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: t('landing.features.realtime.title'),
                description: t('landing.features.realtime.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                gradient: 'from-[#4A90E2] to-[#81E6D9]'
              },
              {
                title: t('landing.features.predictive.title'),
                description: t('landing.features.predictive.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                gradient: 'from-[#9C27B0] to-[#FF6B6B]'
              },
              {
                title: t('landing.features.market.title'),
                description: t('landing.features.market.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                gradient: 'from-[#00BFA5] to-[#FFD700]'
              },
              {
                title: t('landing.features.ai.title'),
                description: t('landing.features.ai.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                gradient: 'from-[#FF9F43] to-[#FF6B6B]'
              },
              {
                title: t('landing.features.insights.title'),
                description: t('landing.features.insights.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                gradient: 'from-[#6FCF97] to-[#4A90E2]'
              },
              {
                title: t('landing.features.secure.title'),
                description: t('landing.features.secure.description'),
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                gradient: 'from-[#9C27B0] to-[#4A90E2]'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-[color:var(--card)] border border-[color:var(--border)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl bg-gradient-to-br ${feature.gradient}`} />
                <div className={`w-12 h-12 mb-6 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} text-[color:var(--color-white)]`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[color:var(--card-foreground)]">
                  {feature.title}
                </h3>
                <p className="text-[color:var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
}

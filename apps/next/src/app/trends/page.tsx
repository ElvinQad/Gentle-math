'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AuthModals } from '@/components/auth/AuthModals';
import { useTranslation } from '@/lib/i18n';

export default function TrendsPage() {
  const { data: session } = useSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { t } = useTranslation();

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
  };

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const trends = [
    {
      title: t('trends.currentTrends.sustainable.title'),
      description: t('trends.currentTrends.sustainable.description'),
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f',
      percentage: 78,
      tags: ['Eco-friendly', 'Sustainable', 'Green'],
    },
    {
      title: t('trends.currentTrends.digital.title'),
      description: t('trends.currentTrends.digital.description'),
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb',
      percentage: 65,
      tags: ['Virtual', 'Digital', 'NFT'],
    },
    {
      title: t('trends.currentTrends.athleisure.title'),
      description: t('trends.currentTrends.athleisure.description'),
      image: 'https://images.unsplash.com/photo-1483721310020-03333e577078',
      percentage: 82,
      tags: ['Sports', 'Comfort', 'Performance'],
    },
  ];

  const colorTrends = [
    {
      name: 'Digital Lavender',
      hex: '#E6E6FA',
      percentage: 85,
      image: 'https://images.unsplash.com/photo-1620207418302-439b387441b0',
    },
    {
      name: 'Viva Magenta',
      hex: '#BB2649',
      percentage: 75,
      image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17',
    },
    {
      name: 'Neo Mint',
      hex: '#98FF98',
      percentage: 70,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    },
    {
      name: 'Butter Yellow',
      hex: '#FFFAA0',
      percentage: 65,
      image: 'https://images.unsplash.com/photo-1490623970972-ae8bb3da443e',
    },
  ];

  return (
    <div className="min-h-screen pt-24 bg-[color:var(--background)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="mb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)]/10 to-[color:var(--color-soft-blue)]/40 rounded-3xl -z-10" />
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 py-8 md:py-12">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {t('trends.hero.title')}
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-soft-blue)] to-[color:var(--color-teal)]">
                  {t('trends.hero.subtitle')}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[color:var(--muted-foreground)] max-w-2xl">
                {t('trends.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto text-center px-6 py-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:bg-[color:var(--primary)]/90 transition-colors"
                  >
                    {t('common.dashboard')}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="w-full sm:w-auto text-center px-6 py-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-lg hover:bg-[color:var(--primary)]/90 transition-colors"
                    >
                      {t('common.login')}
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="w-full sm:w-auto text-center px-6 py-2 border border-[color:var(--primary)] text-[color:var(--primary)] rounded-lg hover:bg-[color:var(--primary)]/10 transition-colors"
                    >
                      {t('common.register')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl transform md:translate-x-12">
              <Image
                src="https://images.unsplash.com/photo-1445205170230-053b83016050"
                alt="Fashion Trends"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* Current Trends */}
        <section className="mb-16 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16 text-[color:var(--foreground)]">
            {t('trends.currentTrends.title')}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {trends.map((trend) => (
              <div
                key={trend.title}
                className="group bg-[color:var(--card)] rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-64">
                  <Image
                    src={trend.image}
                    alt={trend.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-3 text-[color:var(--card-foreground)]">
                    {trend.title}
                  </h3>
                  <p className="text-[color:var(--muted-foreground)] mb-6">{trend.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {trend.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">
                        {t('trends.currentTrends.trendStrength')}
                      </span>
                      <span className="text-[color:var(--primary)] font-medium">{trend.percentage}%</span>
                    </div>
                    <div className="w-full bg-[color:var(--secondary)] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[color:var(--primary)] h-2 transition-all duration-500 rounded-full"
                        style={{
                          width: `${trend.percentage}%`,
                          boxShadow: '0 0 10px rgba(var(--primary), 0.5)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Color Trends */}
        <section className="mb-16 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16 text-[color:var(--foreground)]">
            {t('trends.colorTrends.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {colorTrends.map((color) => (
              <div
                key={color.name}
                className="group bg-[color:var(--card)] rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <Image src={color.image} alt={color.name} fill className="object-cover" />
                  <div
                    className="absolute inset-0 opacity-75"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-[color:var(--color-white)]/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h3 className="text-lg font-semibold text-[color:var(--card-foreground)]">{color.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">
                        {t('trends.colorTrends.popularity')}
                      </span>
                      <span className="text-[color:var(--primary)] font-medium">{color.percentage}%</span>
                    </div>
                    <div className="w-full bg-[color:var(--secondary)] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 transition-all duration-500 rounded-full"
                        style={{
                          width: `${color.percentage}%`,
                          backgroundColor: color.hex,
                          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 md:mb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--color-soft-blue)] opacity-10 rounded-3xl -z-10" />
          <div className="relative bg-[color:var(--card)]/50 backdrop-blur-sm rounded-3xl p-6 md:p-12 text-center border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-[color:var(--card-foreground)]">
              {t('trends.cta.title')}
            </h2>
            <p className="text-base md:text-lg text-[color:var(--muted-foreground)] mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('trends.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-[color:var(--primary)]/90 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {t('common.dashboard')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-[color:var(--primary)]/90 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    {t('trends.cta.loginButton')}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 border-2 border-[color:var(--primary)] text-[color:var(--primary)] px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-[color:var(--primary)]/10 hover:scale-105 transition-all duration-300"
                  >
                    {t('trends.cta.registerButton')}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}

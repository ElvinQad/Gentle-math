'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 bg-[color:var(--background)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="mb-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)]/10 to-[color:var(--color-soft-blue)]/40 rounded-3xl -z-10" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 py-8 md:py-12">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[color:var(--foreground)]">
                {t('about.hero.title')}
                <span className="block text-[color:var(--primary)]">
                  {t('about.hero.subtitle')}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[color:var(--muted-foreground)] max-w-2xl">
                {t('about.hero.description')}
              </p>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl transform md:translate-x-12">
              <Image
                src="https://images.unsplash.com/photo-1542744094-24638eff58bb"
                alt="AI Technology"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16 md:mb-32">
          <div className="relative h-[300px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa"
              alt="Data Visualization"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/50 to-transparent" />
          </div>
          <div className="space-y-6 md:space-y-8 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--foreground)] leading-tight">
              {t('about.mission.title')}
            </h2>
            <div className="space-y-6">
              <p className="text-lg text-[color:var(--muted-foreground)]">{t('about.mission.description1')}</p>
              <p className="text-lg text-[color:var(--muted-foreground)]">{t('about.mission.description2')}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="bg-[color:var(--card)] p-6 rounded-xl border shadow-lg">
                <div className="text-3xl font-bold text-[color:var(--primary)] mb-2">98%</div>
                <div className="text-sm text-[color:var(--muted-foreground)]">{t('about.stats.accuracy')}</div>
              </div>
              <div className="bg-[color:var(--card)] p-6 rounded-xl border shadow-lg">
                <div className="text-3xl font-bold text-[color:var(--primary)] mb-2">500+</div>
                <div className="text-sm text-[color:var(--muted-foreground)]">{t('about.stats.brands')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-[color:var(--foreground)]">
            {t('about.features.title')}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: t('about.features.ai.title'),
                description: t('about.features.ai.description'),
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                ),
              },
              {
                title: t('about.features.realtime.title'),
                description: t('about.features.realtime.description'),
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ),
              },
              {
                title: t('about.features.analytics.title'),
                description: t('about.features.analytics.description'),
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-[color:var(--card)] p-8 rounded-xl shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[color:var(--primary)]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[color:var(--primary)]/20 transition-colors">
                  <svg
                    className="w-7 h-7 text-[color:var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[color:var(--card-foreground)]">{feature.title}</h3>
                <p className="text-[color:var(--muted-foreground)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-[color:var(--foreground)]">
            {t('about.team.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                name: 'Dr. Sarah Chen',
                role: 'AI Research Lead',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
              },
              {
                name: 'Mark Thompson',
                role: 'Fashion Analytics Director',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
              },
              {
                name: 'Lisa Rodriguez',
                role: 'UX Design Lead',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
              },
              {
                name: 'James Wilson',
                role: 'Data Science Manager',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              },
            ].map((member) => (
              <div key={member.name} className="group">
                <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{member.name}</h3>
                <p className="text-sm text-[color:var(--muted-foreground)]">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

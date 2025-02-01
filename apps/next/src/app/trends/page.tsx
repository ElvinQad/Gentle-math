'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AuthModals } from '@/components/auth/AuthModals'

export default function TrendsPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleLoginClick = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const handleRegisterClick = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  const trends = [
    {
      title: 'Sustainable Fashion',
      description: 'Eco-friendly materials and sustainable production methods are gaining momentum.',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f',
      percentage: 78,
      tags: ['Eco-friendly', 'Sustainable', 'Green']
    },
    {
      title: 'Digital Fashion',
      description: 'Virtual clothing and digital fashion experiences are reshaping the industry.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb',
      percentage: 65,
      tags: ['Virtual', 'Digital', 'NFT']
    },
    {
      title: 'Athleisure Evolution',
      description: 'Performance wear continues to influence everyday fashion choices.',
      image: 'https://images.unsplash.com/photo-1483721310020-03333e577078',
      percentage: 82,
      tags: ['Sports', 'Comfort', 'Performance']
    },
  ]

  const colorTrends = [
    { 
      name: 'Digital Lavender',
      hex: '#E6E6FA',
      percentage: 85,
      image: 'https://images.unsplash.com/photo-1620207418302-439b387441b0'
    },
    { 
      name: 'Viva Magenta',
      hex: '#BB2649',
      percentage: 75,
      image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17'
    },
    { 
      name: 'Neo Mint',
      hex: '#98FF98',
      percentage: 70,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27'
    },
    { 
      name: 'Butter Yellow',
      hex: '#FFFAA0',
      percentage: 65,
      image: 'https://images.unsplash.com/photo-1490623970972-ae8bb3da443e'
    },
  ]

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="mb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-3xl -z-10" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 py-12">
              <h1 className="text-6xl font-bold leading-tight">
                Fashion
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                  Trends
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover the latest trends and insights powered by our AI analysis.
              </p>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleLoginClick}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl transform md:translate-x-12">
              <Image
                src="https://images.unsplash.com/photo-1445205170230-053b83016050"
                alt="Fashion Trends"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* Current Trends */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold mb-16 text-foreground">Current Trends</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {trends.map((trend) => (
              <div key={trend.title} className="group bg-card rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="relative h-64">
                  <Image
                    src={trend.image}
                    alt={trend.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-3 text-card-foreground">{trend.title}</h3>
                  <p className="text-muted-foreground mb-6">{trend.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {trend.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trend Strength</span>
                      <span className="text-primary font-medium">{trend.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${trend.percentage}%`,
                          boxShadow: '0 0 10px rgba(var(--primary), 0.5)'
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
        <section className="mb-32">
          <h2 className="text-4xl font-bold mb-16 text-foreground">Color Trends</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {colorTrends.map((color) => (
              <div key={color.name} className="group bg-card rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="relative h-48">
                  <Image
                    src={color.image}
                    alt={color.name}
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-75"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h3 className="text-lg font-semibold text-card-foreground">{color.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Popularity</span>
                      <span className="text-primary font-medium">{color.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${color.percentage}%`,
                          backgroundColor: color.hex,
                          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
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
        <section className="mb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 opacity-10 rounded-3xl -z-10" />
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-12 text-center border">
            <h2 className="text-4xl font-bold mb-6 text-card-foreground">
              Want More Detailed Analysis?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get access to our full range of AI-powered analytics and trend predictions with a dashboard account.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Login to Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 hover:scale-105 transition-all duration-300"
              >
                Create Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
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
  )
} 
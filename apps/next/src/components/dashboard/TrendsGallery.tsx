'use client'

import { useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { type Trend } from '@/types/dashboard'
import Image from 'next/image'

interface TrendsGalleryProps {
  trends?: Trend[]
  isLoading?: boolean
}

export function TrendsGallery({ trends = [], isLoading = false }: TrendsGalleryProps) {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null)

  const handleTrendSelect = useCallback((trend: Trend) => {
    setSelectedTrend(trend)
  }, [])

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-background-secondary rounded-lg overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="flex space-x-4">
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
            </div>
            <div className="h-[200px] bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  }

  if (!trends?.length) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex items-center justify-center h-48 border rounded-lg">
          <p className="text-foreground-secondary">No trends available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trends.map((trend, index) => (
        <div key={trend.id} className="bg-background-secondary rounded-lg overflow-hidden transition-all hover:shadow-lg">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={trend.image}
              alt={trend.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <h3 className="absolute bottom-4 left-4 font-semibold text-lg text-white">
              {trend.title}
            </h3>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{trend.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-foreground-secondary mb-4">
              <span className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                {trend.views.toLocaleString()}
              </span>
              <span className="flex items-center">
                <HeartIcon className="w-4 h-4 mr-1" />
                {trend.likes.toLocaleString()}
              </span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data}>
                  <XAxis dataKey="month" stroke="currentColor" />
                  <YAxis stroke="currentColor" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="hsl(var(--accent-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="3 3" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}
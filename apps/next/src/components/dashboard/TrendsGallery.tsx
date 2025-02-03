'use client'

import { useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { type Trend } from '@/types/dashboard'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { SVGProps } from 'react'

interface TrendsGalleryProps {
  trends?: Trend[]
  isLoading?: boolean
}

interface ChartDataPoint {
  month: string
  value: number
  isActual: boolean
}

export function TrendsGallery({ trends = [], isLoading = false }: TrendsGalleryProps) {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null)
  const [selectedImagePosition, setSelectedImagePosition] = useState<DOMRect | null>(null)

  const handleTrendSelect = useCallback((trend: Trend, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setSelectedImagePosition(rect)
    setSelectedTrend(trend)
  }, [])

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-background-secondary rounded-lg overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-4">
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
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

  // Get current date and add 4 months for forecast
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  
  // Combine actual and forecast into one line
  const getProcessedData = (data: any[]): ChartDataPoint[] => {
    return data.map((item) => ({
      month: item.month,
      value: item.actual ?? item.forecast,
      isActual: item.actual !== null
    }))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend, index) => (
          <div 
            key={trend.id} 
            className="bg-background-secondary rounded-lg overflow-hidden cursor-pointer"
            onClick={(e) => handleTrendSelect(trend, e)}
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={trend.image}
                alt={trend.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <h3 className="absolute bottom-4 left-4 font-semibold text-lg text-white">
                {trend.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTrend && selectedImagePosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrend(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="bg-card w-full max-w-3xl rounded-2xl shadow-xl border overflow-hidden"
              onClick={e => e.stopPropagation()}
              initial={{
                position: 'fixed',
                top: selectedImagePosition.top,
                left: selectedImagePosition.left,
                width: selectedImagePosition.width,
                height: selectedImagePosition.height,
              }}
              animate={{
                top: '50%',
                left: '50%',
                width: 'min(800px, 90vw)',
                height: 'auto',
                y: '-50%',
                x: '-50%',
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="relative">
                <div className="relative h-64 w-full">
                  <Image
                    src={selectedTrend.image}
                    alt={selectedTrend.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {selectedTrend.title}
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-4 text-sm text-foreground-secondary">
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {selectedTrend.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      {selectedTrend.likes.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getProcessedData(selectedTrend.data)}>
                        <XAxis 
                          dataKey="month" 
                          stroke="currentColor"
                          padding={{ left: 0, right: 30 }}
                        />
                        <YAxis stroke="currentColor" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        {/* Base dashed line */}
                        <Line 
                          type="monotone" 
                          dataKey="value"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                        {/* Solid line for actual data */}
                        <Line 
                          type="monotone" 
                          data={getProcessedData(selectedTrend.data).filter(d => d.isActual)}
                          dataKey="value"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTrend(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
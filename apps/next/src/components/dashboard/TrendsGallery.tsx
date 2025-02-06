'use client'

import { useState, useCallback, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine, Label } from 'recharts'
import { type Trend } from '@/types/dashboard'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useModal } from '../navigation/DashboardNav'

interface TrendsGalleryProps {
  trends?: Trend[]
  isLoading?: boolean
}

interface ChartDataPoint {
  month: string
  value: number
  prediction?: number
  upperBound?: number
  lowerBound?: number
  isActual: boolean
}

// Add fake images for the carousel
const additionalImages = [
  'https://picsum.photos/seed/trend1/800/600',
  'https://picsum.photos/seed/trend2/800/600',
  'https://picsum.photos/seed/trend3/800/600',
  'https://picsum.photos/seed/trend4/800/600',
]

export function TrendsGallery({ trends = [], isLoading = false }: TrendsGalleryProps) {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null)
  const [selectedImagePosition, setSelectedImagePosition] = useState<DOMRect | null>(null)
  const [direction, setDirection] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const { theme } = useTheme()
  const { setIsModalOpen } = useModal()

  useEffect(() => {
    setIsModalOpen(!!selectedTrend)
  }, [selectedTrend, setIsModalOpen])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (selectedTrend && isMobile) {
      const hasSeenHint = localStorage.getItem('hasSeenSwipeHint')
      if (!hasSeenHint) {
        setShowSwipeHint(true)
      }
    }
  }, [selectedTrend, isMobile])

  const currentIndex = selectedTrend ? trends.findIndex(t => t.id === selectedTrend.id) : -1;

  const handleTrendSelect = useCallback((trend: Trend, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setSelectedImagePosition(rect)
    setSelectedTrend(trend)
    setDirection(0)
  }, [])


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedTrend) {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setDirection(-1)
        setSelectedTrend(trends[currentIndex - 1])
      } else if (e.key === 'ArrowRight' && currentIndex < trends.length - 1) {
        setDirection(1)
        setSelectedTrend(trends[currentIndex + 1])
      }
    }
  }, [selectedTrend, currentIndex, trends])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleHintDismiss = () => {
    localStorage.setItem('hasSeenSwipeHint', 'true')
    setShowSwipeHint(false)
  }

  if (isLoading) {
    return <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-background-secondary rounded-lg overflow-hidden break-inside-avoid">
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

  // Combine actual and forecast into one line
  const getProcessedData = (data: Array<{ month: string; actual: number | null; forecast: number }>): ChartDataPoint[] => {
    return data.map((item) => ({
      month: item.month,
      value: item.actual ?? 0,
      prediction: item.forecast,
      upperBound: item.actual === null ? item.forecast * 1.15 : undefined,
      lowerBound: item.actual === null ? item.forecast * 0.85 : undefined,
      isActual: item.actual !== null
    }))
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
        {trends.map((trend, index) => (
          <div 
            key={trend.id} 
            className={`bg-background-secondary rounded-lg overflow-hidden cursor-pointer break-inside-avoid group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              index % 5 === 0 ? 'row-span-2 col-span-2' : ''
            }`}
            onClick={(e) => handleTrendSelect(trend, e)}
          >
            <div className="relative h-full w-full">
              <Image
                src={trend.image}
                alt={trend.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                <h3 className="font-semibold text-base md:text-lg text-white line-clamp-2">
                  {trend.title}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-white/80">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {trend.views.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {trend.likes.toLocaleString()}
                  </span>
                </div>
              </div>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              className={`bg-card rounded-lg sm:rounded-2xl shadow-xl border overflow-hidden ${
                isMobile ? 'fixed inset-0 w-full h-full' : 'w-full max-w-5xl'
              }`}
              onClick={e => e.stopPropagation()}
              initial={isMobile ? {
                opacity: 0,
                x: direction * window.innerWidth,
              } : {
                position: 'fixed',
                top: selectedImagePosition.top,
                left: selectedImagePosition.left,
                width: selectedImagePosition.width,
                height: selectedImagePosition.height,
                x: direction * window.innerWidth,
              }}
              animate={isMobile ? {
                opacity: 1,
                x: 0,
              } : {
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: 'min(1200px, 95vw)',
                height: 'auto',
                x: '-50%',
                y: '-50%',
              }}
              exit={isMobile ? {
                opacity: 0,
                x: -direction * window.innerWidth,
              } : {
                position: 'fixed',
                top: selectedImagePosition.top,
                left: selectedImagePosition.left,
                width: selectedImagePosition.width,
                height: selectedImagePosition.height,
                x: -direction * window.innerWidth,
                opacity: 0,
              }}
              transition={{ 
                type: 'spring', 
                damping: isMobile ? 40 : 30, 
                stiffness: isMobile ? 400 : 300,
                bounce: 0
              }}
              drag={isMobile ? true : false}
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                if (!isMobile) return;
                
                const swipeY = offset.y;
                const swipeX = offset.x;
                
                // Check for vertical swipe to close
                if (swipeY > 100 || Math.abs(velocity.y) > 500) {
                  setSelectedTrend(null);
                  return;
                }
                
                // Check for horizontal swipe to navigate
                const threshold = window.innerWidth * 0.2;
                if (Math.abs(velocity.x) > 500 || Math.abs(swipeX) > threshold) {
                  if (swipeX > 0 && currentIndex > 0) {
                    setDirection(-1);
                    setSelectedTrend(trends[currentIndex - 1]);
                  } else if (swipeX < 0 && currentIndex < trends.length - 1) {
                    setDirection(1);
                    setSelectedTrend(trends[currentIndex + 1]);
                  }
                }
              }}
            >
              {/* Swipe Hint Overlay */}
              <AnimatePresence>
                {showSwipeHint && isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center"
                  >
                    <div className="text-white text-center space-y-8 p-6">
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: [-20, 20, -20], opacity: 1 }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="flex items-center space-x-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Swipe to navigate</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.div>

                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: [0, 20, 0], opacity: 1 }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                        className="flex flex-col items-center space-y-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-sm font-medium">Swipe down to close</span>
                      </motion.div>

                      <button
                        onClick={handleHintDismiss}
                        className="mt-8 px-8 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                      >
                        Got it
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pull indicator for mobile */}
              {isMobile && (
                <div className="absolute top-0 left-0 right-0 flex justify-center">
                  <div className="w-12 h-1 rounded-full bg-muted-foreground/20 my-2" />
                </div>
              )}

              <div className={`relative flex flex-col ${isMobile ? 'h-full touch-none' : 'lg:flex-row'}`}>
                {/* Mobile Title Bar */}
                {isMobile && (
                  <div className="relative h-14 flex items-center justify-center border-b border-border bg-card/80 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedTrend.title}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrend(null);
                      }}
                      className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Desktop Navigation Buttons */}
                {!isMobile && (
                  <>
                    {currentIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(-1);
                          setSelectedTrend(trends[currentIndex - 1]);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {currentIndex < trends.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(1);
                          setSelectedTrend(trends[currentIndex + 1]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </>
                )}

                {/* Desktop Close button */}
                {!isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrend(null);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <div className={`${isMobile ? 'h-[40%]' : 'lg:w-2/5'}`}>
                  <div className="relative h-full">
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.div
                        key={currentImageIndex}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 cursor-zoom-in"
                        onClick={() => setIsFullScreen(true)}
                      >
                        <Image
                          src={currentImageIndex === 0 ? selectedTrend.image : additionalImages[currentImageIndex - 1]}
                          alt={selectedTrend.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>
                    
          

                    {/* Image Navigation Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {[selectedTrend.image, ...additionalImages].map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDirection(index > currentImageIndex ? 1 : -1);
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'bg-white w-4'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`${isMobile ? 'h-[60%]' : 'lg:w-3/5'} bg-background flex flex-col`}>
                {!isMobile && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h2 className="absolute top-2 right-44 text-2xl font-bold text-white">
                      {selectedTrend.title}
                    </h2>
                      </>
                    )}
                  <div className="h-full overflow-y-auto overscroll-y-contain touch-pan-y">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="h-[300px] sm:h-[400px] w-full">
                    
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getProcessedData(selectedTrend.data)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id={`colorValue-${selectedTrend.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme === 'dark' ? '#8884d8' : '#6366f1'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme === 'dark' ? '#8884d8' : '#6366f1'} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id={`colorPrediction-${selectedTrend.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme === 'dark' ? '#82ca9d' : '#10b981'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme === 'dark' ? '#82ca9d' : '#10b981'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="month" 
                          stroke="currentColor"
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          stroke="currentColor"
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={theme === 'dark' ? '#8884d8' : '#6366f1'}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#colorValue-${selectedTrend.id})`}
                          name="Historical"
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        
                        <Area
                          type="monotone"
                          dataKey="prediction"
                          stroke={theme === 'dark' ? '#82ca9d' : '#10b981'}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#colorPrediction-${selectedTrend.id})`}
                          name="Prediction"
                          dot={{ r: 4, strokeWidth: 2 }}
                          strokeDasharray="5 5"
                        />

                        <ReferenceLine 
                          y={getProcessedData(selectedTrend.data)
                              .filter(d => d.isActual)
                              .reduce((acc, curr) => acc + (curr.value || 0), 0) / 
                              getProcessedData(selectedTrend.data).filter(d => d.isActual).length
                          } 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="3 3"
                        >
                          <Label 
                            value="Average" 
                            position="insideLeft"
                            fill="currentColor"
                          />
                        </ReferenceLine>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-5 gap-2 pt-4">
                    <div
                      onClick={() => {
                        setDirection(currentImageIndex > 0 ? -1 : 1);
                        setCurrentImageIndex(0);
                      }}
                      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group ${
                        currentImageIndex === 0 ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <Image
                        src={selectedTrend.image}
                        alt={selectedTrend.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    {additionalImages.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setDirection(index + 1 > currentImageIndex ? 1 : -1);
                          setCurrentImageIndex(index + 1);
                        }}
                        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group ${
                          currentImageIndex === index + 1 ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${selectedTrend.title} - Image ${index + 2}`}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Image View */}
      <AnimatePresence>
        {isFullScreen && selectedTrend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center"
            onClick={() => setIsFullScreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-[90vw] h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImageIndex === 0 ? selectedTrend.image : additionalImages[currentImageIndex - 1]}
                alt={selectedTrend.title}
                fill
                className="object-contain"
                priority
              />
              
              {/* Full Screen Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentImageIndex > 0) {
                    setDirection(-1);
                    setCurrentImageIndex(currentImageIndex - 1);
                  }
                }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors ${
                  currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                disabled={currentImageIndex === 0}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentImageIndex < additionalImages.length) {
                    setDirection(1);
                    setCurrentImageIndex(currentImageIndex + 1);
                  }
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors ${
                  currentImageIndex === additionalImages.length ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                disabled={currentImageIndex === additionalImages.length}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { type Trend } from '@/types/dashboard';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useModal } from '../navigation/DashboardNav';

interface TrendsGalleryProps {
  trends?: Trend[];
  isLoading?: boolean;
}

export function TrendsGallery({ trends = [], isLoading = false }: TrendsGalleryProps) {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [selectedImagePosition, setSelectedImagePosition] = useState<DOMRect | null>(null);
  const [direction, setDirection] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setIsModalOpen } = useModal();

  useEffect(() => {
    setIsModalOpen(!!selectedTrend);
  }, [selectedTrend, setIsModalOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentIndex = selectedTrend ? trends.findIndex((t) => t.id === selectedTrend.id) : -1;

  const handleTrendSelect = useCallback((trend: Trend, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSelectedImagePosition(rect);
    setSelectedTrend(trend);
    setCurrentImageIndex(trend.mainImageIndex || 0);
    setDirection(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedTrend) {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setDirection(-1);
          const prevTrend = trends[currentIndex - 1];
          setSelectedTrend(prevTrend);
          setCurrentImageIndex(prevTrend.mainImageIndex || 0);
        } else if (e.key === 'ArrowRight' && currentIndex < trends.length - 1) {
          setDirection(1);
          const nextTrend = trends[currentIndex + 1];
          setSelectedTrend(nextTrend);
          setCurrentImageIndex(nextTrend.mainImageIndex || 0);
        }
      }
    },
    [selectedTrend, currentIndex, trends],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navigateTrend = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < trends.length) {
      setDirection(direction);
      const targetTrend = trends[newIndex];
      setSelectedTrend(targetTrend);
      setCurrentImageIndex(targetTrend.mainImageIndex || 0);
    }
  };

  // Define reusable classes for consistent styling
  const cardClasses = 'bg-[color:var(--background-secondary)] rounded-lg overflow-hidden ' +
    'cursor-pointer break-inside-avoid group transform transition-all duration-300 ease-out-expo ' +
    'hover:shadow-lg hover:-translate-y-1 hover:shadow-[color:var(--color-soft-blue)]/10';

  const imageOverlayClasses = 'absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/60 to-transparent ' +
    'transition-opacity duration-300 ease-out-expo';

  const titleClasses = 'font-semibold text-base md:text-lg text-white line-clamp-2 ' +
    'transition-transform duration-300 ease-out-expo group-hover:translate-y-0';

  const descriptionClasses = 'text-sm text-white/80 line-clamp-2 ' +
    'transition-transform duration-300 ease-out-expo group-hover:translate-y-0';

  const tagClasses = 'inline-block px-2 py-1 text-xs rounded-full ' +
    'bg-[color:var(--color-soft-blue)]/10 text-[color:var(--color-soft-blue)] ' +
    'transition-all duration-300 ease-out-expo group-hover:bg-[color:var(--color-soft-blue)]/20';

  const modalClasses = 'fixed inset-0 bg-[color:var(--color-charcoal)]/80 backdrop-blur-sm z-50 ' +
    'flex items-center justify-center';

  const modalContentClasses = 'bg-[color:var(--background)] rounded-lg sm:rounded-2xl shadow-xl ' +
    'border border-[color:var(--border)] overflow-hidden ' +
    'transition-all duration-300 ease-out-expo';

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`${cardClasses} animate-pulse ${i % 5 === 0 ? 'row-span-2 col-span-2' : ''}`}
          >
            <div className="h-full bg-[color:var(--muted)]/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!trends?.length) {
    return (
      <div className="grid place-items-center h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-[color:var(--muted-foreground)] text-lg">No trends available</div>
          <p className="text-sm text-[color:var(--muted-foreground)]/80">
            Check back later for new trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
        {trends.map((trend, index) => (
          <div
            key={trend.id}
            className={`${cardClasses} ${index % 5 === 0 ? 'row-span-2 col-span-2' : ''}`}
            onClick={(e) => handleTrendSelect(trend, e)}
          >
            <div className="relative h-full w-full">
              <Image
                src={trend.imageUrls[trend.mainImageIndex || 0]}
                alt={trend.title}
                fill
                className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
              <div className={imageOverlayClasses} />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 transform transition-transform duration-300 ease-out-expo">
                <h3 className={titleClasses}>{trend.title}</h3>
                <p className={descriptionClasses}>{trend.description}</p>
                <span className={tagClasses}>{trend.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Views */}
      <AnimatePresence>
        {selectedTrend && selectedImagePosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrend(null)}
            className={modalClasses}
          >
            <motion.div
              className={`${modalContentClasses} ${
                isMobile ? 'fixed inset-0 w-full h-full' : 'w-full max-w-5xl'
              }`}
              onClick={(e) => e.stopPropagation()}
              initial={
                isMobile
                  ? {
                      opacity: 0,
                      y: 100,
                    }
                  : {
                      position: 'fixed',
                      top: selectedImagePosition.top,
                      left: selectedImagePosition.left,
                      width: selectedImagePosition.width,
                      height: selectedImagePosition.height,
                    }
              }
              animate={
                isMobile
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      width: 'min(1200px, 95vw)',
                      height: 'auto',
                      x: '-50%',
                      y: '-50%',
                    }
              }
              exit={
                isMobile
                  ? {
                      opacity: 0,
                      y: 100,
                    }
                  : {
                      position: 'fixed',
                      top: selectedImagePosition.top,
                      left: selectedImagePosition.left,
                      width: selectedImagePosition.width,
                      height: selectedImagePosition.height,
                      opacity: 0,
                    }
              }
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                bounce: 0,
              }}
            >
              {/* Navigation Buttons */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTrend(-1);
                  }}
                  className={`p-2 rounded-full bg-[color:var(--color-charcoal)]/50 text-white 
                    backdrop-blur-sm pointer-events-auto transition-all duration-300 ease-out-expo
                    ${
                    currentIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'opacity-100 cursor-pointer hover:bg-[color:var(--color-charcoal)]/75'
                  }`}
                  disabled={currentIndex === 0}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTrend(1);
                  }}
                  className={`p-2 rounded-full bg-[color:var(--color-charcoal)]/50 text-white 
                    backdrop-blur-sm pointer-events-auto transition-all duration-300 ease-out-expo
                    ${
                    currentIndex === trends.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'opacity-100 cursor-pointer hover:bg-[color:var(--color-charcoal)]/75'
                  }`}
                  disabled={currentIndex === trends.length - 1}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Image Section */}
              <div className={`relative flex flex-col ${isMobile ? 'h-full' : 'lg:flex-row'}`}>
                {/* Image Section */}
                <div className={`${isMobile ? 'h-[40%]' : 'lg:w-2/5'}`}>
                  <div className="relative h-full">
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.div
                        key={`${selectedTrend.id}-${currentImageIndex}`}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0 cursor-zoom-in"
                        onClick={() => setIsFullScreen(true)}
                      >
                        <Image
                          src={selectedTrend.imageUrls[currentImageIndex]}
                          alt={selectedTrend.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Image Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {selectedTrend.imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDirection(index > currentImageIndex ? 1 : -1);
                            setCurrentImageIndex(index);
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ease-out-expo ${
                            index === currentImageIndex
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`${isMobile ? 'h-[60%]' : 'lg:w-3/5'} bg-[color:var(--background)] flex flex-col`}>
                  <div className="h-full overflow-y-auto overscroll-y-contain touch-pan-y">
                    <div className="p-4 sm:p-6 space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
                          {selectedTrend.title}
                        </h2>
                        <p className="text-[color:var(--muted-foreground)]">
                          {selectedTrend.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={tagClasses}>{selectedTrend.type}</span>
                          <span className="text-sm text-[color:var(--muted-foreground)]">
                            {new Date(selectedTrend.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Chart */}
                      {selectedTrend?.analytics?.[0]?.dates && selectedTrend?.analytics?.[0]?.values && (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={(selectedTrend?.analytics?.[0]?.dates || []).map((date, i) => {
                                const currentDate = new Date(date);
                                const now = new Date();
                                const isCurrentMonth = currentDate.getMonth() === now.getMonth() && 
                                                     currentDate.getFullYear() === now.getFullYear();
                                const isActual = currentDate < now || 
                                               (currentDate.getMonth() < now.getMonth() && 
                                                currentDate.getFullYear() === now.getFullYear());
                                const value = selectedTrend?.analytics?.[0]?.values?.[i] || 0;
                                
                                return {
                                  date: currentDate.toISOString().slice(0, 7),
                                  displayDate: currentDate.toLocaleDateString('en-GB', { 
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  }).replace(/\//g, '.'),
                                  actual: isActual ? value : undefined,
                                  predicted: (!isActual || isCurrentMonth) ? value : undefined,
                                };
                              })}
                              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--color-soft-blue)" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="var(--color-soft-blue)" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--color-muted-green)" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="var(--color-muted-green)" stopOpacity={0.05}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                              <XAxis
                                dataKey="displayDate"
                                stroke="var(--muted-foreground)"
                                tickFormatter={(date) => date.split('.').slice(0, 2).join('.')}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                stroke="var(--muted-foreground)" 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '0.5rem',
                                  fontSize: '12px',
                                }}
                                formatter={(value: number, name: string, props: any) => {
                                  const item = props.payload;
                                  const now = new Date();
                                  const itemDate = new Date(item.date);
                                  const isCurrentMonth = itemDate.getMonth() === now.getMonth() && 
                                                       itemDate.getFullYear() === now.getFullYear();
                                  
                                  // For current month, show Value
                                  if (isCurrentMonth) {
                                    if (name === 'actual') return [null, null];
                                    return [`${value.toFixed(1)}%`, 'Value'];
                                  }
                                  
                                  // For future dates, show Predicted
                                  if (item.predicted !== undefined && !isCurrentMonth) {
                                    if (name === 'actual') return [null, null];
                                    return [`${value.toFixed(1)}%`, 'Predicted'];
                                  }
                                  
                                  // For past dates, show Actual
                                  return [`${value.toFixed(1)}%`, 'Actual'];
                                }}
                                labelFormatter={(date) => date}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={36}
                                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                              />
                              <ReferenceLine
                                x={new Date().toISOString().slice(0, 7)}
                                stroke="var(--muted-foreground)"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                label={{
                                  value: 'Current',
                                  position: 'top',
                                  fill: 'var(--muted-foreground)',
                                  fontSize: 12
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="actual"
                                name="Actual"
                                stroke="var(--color-soft-blue)"
                                strokeWidth={2}
                                fill="url(#actualGradient)"
                                isAnimationActive={true}
                                animationDuration={1000}
                                dot={{ fill: 'var(--color-soft-blue)', r: 2 }}
                                activeDot={{ r: 4, strokeWidth: 1 }}
                              />
                              <Area
                                type="monotone"
                                dataKey="predicted"
                                name="Predicted"
                                stroke="var(--color-muted-green)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="url(#predictedGradient)"
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationBegin={1000}
                                dot={{ fill: 'var(--color-muted-green)', r: 2 }}
                                activeDot={{ r: 4, strokeWidth: 1 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Thumbnail Gallery */}
                      <div className="grid grid-cols-5 gap-2">
                        {selectedTrend.imageUrls.map((url, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setDirection(index > currentImageIndex ? 1 : -1);
                              setCurrentImageIndex(index);
                            }}
                            className={`relative group aspect-video cursor-pointer rounded-lg overflow-hidden 
                              ${
                                currentImageIndex === index
                                  ? 'ring-2 ring-[color:var(--color-soft-blue)]'
                                  : ''
                              }`}
                          >
                            <Image
                              src={url}
                              alt={`${selectedTrend?.title || 'Trend'} - Image ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 ease-out-expo group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out-expo" />
                            {index === selectedTrend.mainImageIndex && (
                              <div className="absolute top-1 right-1 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-xs px-1.5 py-0.5 rounded-full">
                                Main
                              </div>
                            )}
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
            className="fixed inset-0 bg-[color:var(--color-charcoal)]/90 z-[60] flex items-center justify-center"
            onClick={() => setIsFullScreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-[90vw] h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedTrend.imageUrls[currentImageIndex]}
                alt={selectedTrend.title || 'Trend image'}
                fill
                className="object-contain"
                priority
              />

              {/* Navigation Controls */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex > 0) {
                      setDirection(-1);
                      setCurrentImageIndex(currentImageIndex - 1);
                    }
                  }}
                  className={`p-2 rounded-full bg-[color:var(--color-charcoal)]/50 text-white 
                    backdrop-blur-sm pointer-events-auto transition-all duration-300 ease-out-expo
                    ${
                    currentImageIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'opacity-100 cursor-pointer hover:bg-[color:var(--color-charcoal)]/75'
                  }`}
                  disabled={currentImageIndex === 0}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex < selectedTrend.imageUrls.length - 1) {
                      setDirection(1);
                      setCurrentImageIndex(currentImageIndex + 1);
                    }
                  }}
                  className={`p-2 rounded-full bg-[color:var(--color-charcoal)]/50 text-white 
                    backdrop-blur-sm pointer-events-auto transition-all duration-300 ease-out-expo
                    ${
                    currentImageIndex === selectedTrend.imageUrls.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'opacity-100 cursor-pointer hover:bg-[color:var(--color-charcoal)]/75'
                  }`}
                  disabled={currentImageIndex === selectedTrend.imageUrls.length - 1}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[color:var(--color-charcoal)]/50 
                  text-white backdrop-blur-sm transition-all duration-300 ease-out-expo
                  hover:bg-[color:var(--color-charcoal)]/75"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

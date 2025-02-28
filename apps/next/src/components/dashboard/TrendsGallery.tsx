'use client';

import { useState, useCallback, useEffect } from 'react';
import { type Trend } from '@/types/dashboard';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../navigation/DashboardNav';
import { TrendChart } from '@/components/ui/TrendChart';
import { Switch } from '@/components/ui/switch';
import { AgeSegmentPie } from '@/components/ui/AgeSegmentPie';
import { SubscriptionRequired } from '@/components/ui/SubscriptionRequired';

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
  const [isYearlyView, setIsYearlyView] = useState(false);
  const { setIsModalOpen } = useModal();

  useEffect(() => {
    // Add the keyframe animation styles to the document head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animate-gradient-slow {
        background-size: 200% 200%;
        animation: gradient 8s ease infinite;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
    'cursor-pointer break-inside-avoid group transform transition-all duration-500 ease-out-expo ' +
    'hover:shadow-lg hover:-translate-y-1 hover:shadow-[color:var(--color-soft-blue)]/10';

  const imageOverlayClasses = 'absolute inset-0 bg-gradient-to-t from-[color:var(--color-charcoal)]/80 via-[color:var(--color-charcoal)]/40 to-transparent ' +
    'opacity-70 group-hover:opacity-90 transition-all duration-500 ease-out-expo';

  const titleClasses = 'font-semibold text-base md:text-lg text-white line-clamp-2 ' +
    'transition-all duration-500 ease-out-expo transform group-hover:translate-y-0 group-hover:scale-105';

  const descriptionClasses = 'text-sm text-white/80 line-clamp-2 ' +
    'transition-all duration-500 ease-out-expo transform group-hover:translate-y-0';

  const tagClasses = 'inline-block px-2 py-1 text-xs rounded-full ' +
    'bg-[color:var(--color-soft-blue)]/10 text-[color:var(--color-soft-blue)] ' +
    'transition-all duration-500 ease-out-expo group-hover:bg-[color:var(--color-soft-blue)]/20';

  const modalClasses = 'fixed inset-0 bg-[color:var(--color-charcoal)]/80 backdrop-blur-sm z-50 ' +
    'flex items-center justify-center';

  const modalContentClasses = 'bg-[color:var(--background)] rounded-lg sm:rounded-2xl shadow-xl ' +
    'border border-[color:var(--border)] overflow-hidden ' +
    'transition-all duration-700 ease-out-expo';

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
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              ease: [0.19, 1, 0.22, 1]
            }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
            }}
            className={`${cardClasses} ${index % 5 === 0 ? 'row-span-2 col-span-2' : ''}`}
            onClick={(e) => handleTrendSelect(trend, e)}
          >
            <div className="relative h-full w-full overflow-hidden">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={trend.imageUrls[trend.mainImageIndex || 0]}
                  alt={trend.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </motion.div>
              <div className={imageOverlayClasses} />
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                whileHover={{ y: -5, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute bottom-0 left-0 right-0 p-4 space-y-2 z-10"
              >
                <h3 className={titleClasses}>{trend.title}</h3>
                <p className={descriptionClasses}>{trend.description}</p>
                <span className={tagClasses}>{trend.type}</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Views */}
      <AnimatePresence>
        {selectedTrend && selectedImagePosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedTrend(null);
              setSelectedImagePosition(null);
              setCurrentImageIndex(0);
            }}
            className={modalClasses}
          >
            <motion.div
              className={`${modalContentClasses} ${
                isMobile ? 'fixed inset-0 w-full h-full' : 'w-full max-w-7xl'
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
                      top: `calc(48vh + ${window.scrollY}px)`,
                      left: '50%',
                      width: 'min(1400px, 95vw)',
                      height: 'min(800px, 90vh)',
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
              <div className={`relative flex flex-col ${isMobile ? 'h-full' : 'lg:flex-row h-full'}`}>
                {/* Image Section */}
                <div className={`${isMobile ? 'h-[40%]' : 'lg:w-[45%] h-full'}`}>
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
                <div className={`${isMobile ? 'h-[60%]' : 'lg:w-[55%] h-full'} bg-[color:var(--background)] flex flex-col`}>
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
                      {selectedTrend?.analytics?.[0]?.dates && selectedTrend?.analytics?.[0]?.values && !selectedTrend.isRestricted ? (
                        <div className="space-y-6">
                          {/* View Toggle - Only show if data spans more than 10 months */}
                          {selectedTrend.analytics[0].dates.length > 10 && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm text-[color:var(--muted-foreground)]">
                                {isYearlyView ? 'Yearly View' : 'Monthly View'}
                              </span>
                              <Switch
                                checked={isYearlyView}
                                onCheckedChange={setIsYearlyView}
                                className="data-[state=checked]:bg-[color:var(--primary)]"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-6">
                            <div className="h-[350px] w-full">
                              <TrendChart
                                dates={selectedTrend.analytics[0].dates}
                                values={selectedTrend.analytics[0].values}
                                isYearlyView={isYearlyView}
                              />
                            </div>
                            {selectedTrend.analytics[0].ageSegments && (
                              <div className="h-[350px] w-full">
                                <div className="mb-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                                  Age Distribution
                                </div>
                                <AgeSegmentPie
                                  data={selectedTrend.analytics[0].ageSegments.map(segment => ({
                                    name: segment.name,
                                    value: segment.value
                                  }))}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <SubscriptionRequired
                          title="Analytics Available with Premium"
                          description="Subscribe to unlock detailed analytics, including historical data, predictions, and age demographics for all trends."
                          features={[
                            'Trend Analytics',
                            'Demographics'
                          ]}
                        />
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

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTrend(null);
                  setSelectedImagePosition(null);
                  setCurrentImageIndex(0);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-[color:var(--background)]/10 
                  text-[color:var(--foreground)] backdrop-blur-sm z-50 transition-all duration-300 
                  hover:bg-[color:var(--background)]/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TrendChart } from '@/components/ui/TrendChart';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SubscriptionRequired } from '@/components/ui/SubscriptionRequired';
import { type ColorTrend } from '@/types/colors';

interface ColorModalProps {
  trend: ColorTrend | null;
  isOpen: boolean;
  onClose: () => void;
  isYearlyView?: boolean;
  onYearlyViewChange?: (value: boolean) => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function ColorModal({
  trend,
  isOpen,
  onClose,
  isYearlyView = false,
  onYearlyViewChange,
  showDeleteButton = false,
  onDelete,
  onEdit,
}: ColorModalProps) {
  if (!trend) return null;

  const paletteColors = [trend.palette1, trend.palette2, trend.palette3, trend.palette4, trend.palette5]
    .filter((color): color is string => Boolean(color));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] bg-[color:var(--background)] 
        animate-fade-in p-0 overflow-hidden border-none rounded-lg">
        <DialogTitle className="sr-only">
          Color Trend Details - {trend.name}
        </DialogTitle>
        
        <div className="relative flex flex-col h-full max-h-[85vh] overflow-hidden">
          {/* Hero Section - More compact */}
          <div className="relative h-[150px] sm:h-[200px] w-full group/hero overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out-expo group-hover/hero:scale-105">
              <Image
                src={trend.imageUrl}
                alt={trend.name}
                fill
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{ 
                  background: `linear-gradient(to bottom, ${trend.hex}99, ${trend.hex}ee)`,
                  mixBlendMode: 'multiply',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--background)] via-transparent to-transparent" />
            </div>
            
            {/* Title Section - More compact */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-lg backdrop-blur-sm
                    transform rotate-45 transition-transform hover:rotate-90"
                  style={{ 
                    backgroundColor: `${trend.hex}cc`,
                    boxShadow: `0 4px 16px ${trend.hex}66`
                  }}
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-md">{trend.name}</h2>
                  <code className="px-2 py-1 rounded-md bg-[color:var(--background)]/90 text-xs font-mono backdrop-blur-sm">
                    {trend.hex}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-grow" style={{ scrollbarWidth: 'thin' }}>
            {/* Content Section - More compact spacing */}
            <div className="p-3 sm:p-4 space-y-4">
              {/* Color Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-md">
                  <h3 className="text-base sm:text-lg font-semibold text-[color:var(--card-foreground)]">Color Details</h3>
                  <div className="space-y-3 mt-2">
                    <div>
                      <span className="text-[color:var(--muted-foreground)] text-xs block mb-1">Popularity</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[color:var(--secondary)]/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full relative"
                            style={{
                              width: `${trend.popularity}%`,
                              backgroundColor: trend.hex,
                              boxShadow: `0 0 8px ${trend.hex}66`
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          </div>
                        </div>
                        <span className="font-medium text-[color:var(--primary)] min-w-[2.5rem] text-right text-sm">
                          {trend.popularity}%
                        </span>
                      </div>
                    </div>

                    {trend.createdAt && (
                      <div>
                        <span className="text-[color:var(--muted-foreground)] text-xs block mb-1">Created</span>
                        <span className="text-[color:var(--foreground)] font-medium text-sm">
                          {new Date(trend.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {paletteColors.length > 0 && (
                  <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-md">
                    <h3 className="text-base sm:text-lg font-semibold text-[color:var(--card-foreground)]">Color Palette</h3>
                    <div className="space-y-2 mt-2">
                      <div className="h-8 sm:h-10 rounded-lg overflow-hidden shadow-md">
                        <div className="flex h-full">
                          {paletteColors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 transition-all hover:flex-[1.2] relative group"
                              style={{ 
                                backgroundColor: color,
                                transform: `skewX(-15deg) translateX(-${index * 4}px)`,
                              }}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                                flex items-center justify-center transform -skewX(15deg)">
                                <code className="text-xs px-1.5 py-0.5 rounded bg-black/40 text-white font-mono backdrop-blur-sm">
                                  {color}
                                </code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        Hover over colors for hex codes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analytics Section */}
              {trend.analytics && (
                <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[color:var(--card-foreground)]">Trend Analytics</h3>
                    {trend.analytics.dates.length > 10 && onYearlyViewChange && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          {isYearlyView ? 'Yearly View' : 'Monthly View'}
                        </span>
                        <Switch
                          checked={isYearlyView}
                          onCheckedChange={onYearlyViewChange}
                          className="data-[state=checked]:bg-[color:var(--primary)]"
                        />
                      </div>
                    )}
                  </div>
                  {!trend.isRestricted ? (
                    <div className="h-[200px] sm:h-[220px]">
                      <TrendChart
                        dates={trend.analytics.dates}
                        values={trend.analytics.values}
                        height="100%"
                        isYearlyView={isYearlyView}
                      />
                    </div>
                  ) : (
                    <SubscriptionRequired
                      title="Analytics Available with Premium"
                      description="Subscribe to unlock detailed analytics, including historical data, predictions, and age demographics for all trends."
                      features={[
                        'Trend Analytics',
                        'Demographics',
                        'Historical Data',
                        'Market Insights'
                      ]}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Section - Fixed at bottom */}
          <div className="flex justify-end gap-2 p-3 border-t border-[color:var(--border)] bg-[color:var(--background)] flex-shrink-0">
            {showDeleteButton && onDelete && (
              <Button
                onClick={onDelete}
                variant="destructive"
                className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)]
                  hover:bg-[color:var(--destructive)]/90 px-3 py-1.5 text-xs sm:text-sm shadow-md"
                size="sm"
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                className="bg-[color:var(--background)]/50 text-[color:var(--foreground)]
                  hover:bg-[color:var(--muted)]/50 px-3 py-1.5 text-xs sm:text-sm shadow-md"
                size="sm"
              >
                Edit
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-[color:var(--background)]/50 text-[color:var(--foreground)]
                hover:bg-[color:var(--muted)]/50 px-3 py-1.5 text-xs sm:text-sm shadow-md"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
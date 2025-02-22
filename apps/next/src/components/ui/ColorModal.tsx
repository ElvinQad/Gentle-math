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
    .filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] bg-[color:var(--background)] 
        animate-fade-in p-0 overflow-y-auto scrollbar-thin border-none">
        <DialogTitle className="sr-only">
          Color Trend Details - {trend.name}
        </DialogTitle>
        
        <div className="relative flex flex-col">
          {/* Hero Section */}
          <div className="relative h-[200px] sm:h-[300px] w-full group/hero overflow-hidden">
            <div className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out-expo group-hover/hero:scale-110">
              <Image
                src={trend.imageUrl}
                alt={trend.name}
                fill
                className="object-cover transition-transform duration-700 ease-out-expo"
                priority
              />
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{ 
                  background: `linear-gradient(to bottom, ${trend.hex}99, ${trend.hex}ee)`,
                  mixBlendMode: 'multiply',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--background)] via-transparent to-transparent" />
            </div>
            
            {/* Title Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg backdrop-blur-sm
                    transform rotate-45 transition-transform hover:rotate-90"
                  style={{ 
                    backgroundColor: `${trend.hex}cc`,
                    boxShadow: `0 8px 32px ${trend.hex}66`
                  }}
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">{trend.name}</h2>
                  <code className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-[color:var(--background)]/90 text-sm font-mono backdrop-blur-sm">
                    {trend.hex}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Color Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-[color:var(--card-foreground)]">Color Details</h3>
                <div className="space-y-4 mt-4">
                  <div>
                    <span className="text-[color:var(--muted-foreground)] text-sm block mb-1">Popularity</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-[color:var(--secondary)]/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className="h-full rounded-full relative"
                          style={{
                            width: `${trend.popularity}%`,
                            backgroundColor: trend.hex,
                            boxShadow: `0 0 12px ${trend.hex}66`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                      <span className="font-medium text-[color:var(--primary)] min-w-[3rem] text-right">
                        {trend.popularity}%
                      </span>
                    </div>
                  </div>

                  {trend.createdAt && (
                    <div>
                      <span className="text-[color:var(--muted-foreground)] text-sm block mb-1">Created</span>
                      <span className="text-[color:var(--foreground)] font-medium">
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
                <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-[color:var(--card-foreground)]">Color Palette</h3>
                  <div className="space-y-3 mt-4">
                    <div className="h-10 sm:h-12 rounded-lg overflow-hidden shadow-lg">
                      <div className="flex h-full">
                        {paletteColors.map((color, index) => (
                          <div
                            key={index}
                            className="flex-1 transition-all hover:flex-[1.2] relative group"
                            style={{ 
                              backgroundColor: color,
                              transform: `skewX(-15deg) translateX(-${index * 6}px)`,
                            }}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                              flex items-center justify-center transform -skewX(15deg)">
                              <code className="text-xs px-2 py-1 rounded bg-black/40 text-white font-mono backdrop-blur-sm">
                                {color}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[color:var(--muted-foreground)]">
                      Hover over each color to see its hex code
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Section */}
            {trend.analytics && (
              <div className="bg-[color:var(--card)]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-[color:var(--card-foreground)]">Trend Analytics</h3>
                  {trend.analytics.dates.length > 10 && onYearlyViewChange && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[color:var(--muted-foreground)]">
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
                  <div className="h-[250px] sm:h-[300px]">
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

            {/* Actions Section */}
            <div className="flex justify-end gap-2 sm:gap-3 pt-4">
              {showDeleteButton && onDelete && (
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)]
                    hover:bg-[color:var(--destructive)]/90 px-4 sm:px-6 text-sm shadow-lg"
                >
                  Delete
                </Button>
              )}
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  className="bg-[color:var(--background)]/50 backdrop-blur-sm text-[color:var(--foreground)]
                    hover:bg-[color:var(--muted)]/50 px-4 sm:px-6 text-sm shadow-lg"
                >
                  Edit
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-[color:var(--background)]/50 backdrop-blur-sm text-[color:var(--foreground)]
                  hover:bg-[color:var(--muted)]/50 px-4 sm:px-6 text-sm shadow-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
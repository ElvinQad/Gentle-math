import Image from 'next/image';
import { type ColorTrend } from '@/types/colors';

interface ColorCardProps {
  trend: ColorTrend;
  onClick?: () => void;
  showCreatedDate?: boolean;
  className?: string;
}

export function ColorCard({ trend, onClick, showCreatedDate = false, className = '' }: ColorCardProps) {
  const paletteColors = [trend.palette1, trend.palette2, trend.palette3, trend.palette4, trend.palette5]
    .filter(Boolean);

  return (
    <div
      onClick={onClick}
      className={`group bg-[color:var(--card)] rounded-xl overflow-hidden shadow-lg  
        hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer animate-fade-in ${className}`}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={trend.imageUrl}
          alt={trend.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 opacity-75 transition-opacity group-hover:opacity-60"
          style={{ backgroundColor: trend.hex }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--card)] via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg border border-[color:var(--border)] shadow-inner
              transform transition-transform group-hover:rotate-45"
            style={{ backgroundColor: trend.hex }}
          />
          <h3 className="text-lg font-semibold text-[color:var(--card-foreground)] group-hover:text-[color:var(--primary)]">
            {trend.name}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[color:var(--muted-foreground)]">Popularity</span>
              <span className="text-[color:var(--primary)] font-medium">{trend.popularity}%</span>
            </div>
            <div className="w-full bg-[color:var(--secondary)] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full relative"
                style={{
                  width: `${trend.popularity}%`,
                  backgroundColor: trend.hex,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          
          {paletteColors.length > 0 && (
            <div className="pt-4 border-t border-[color:var(--border)]">
              <span className="text-sm text-[color:var(--muted-foreground)] mb-3 block">Color Palette</span>
              <div className="relative h-6 rounded-lg overflow-hidden shadow-sm">
                <div className="absolute inset-0 flex">
                  {paletteColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 transition-transform hover:scale-105 hover:z-10"
                      style={{ 
                        backgroundColor: color,
                        transform: `skewX(-15deg) translateX(-${index * 4}px)`,
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCreatedDate && trend.createdAt && (
            <div className="flex justify-between text-sm pt-3">
              <span className="text-[color:var(--muted-foreground)]">Created</span>
              <span className="text-[color:var(--foreground)]">
                {new Date(trend.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
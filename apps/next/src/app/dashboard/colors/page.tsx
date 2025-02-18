'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { TrendChart } from '@/components/ui/TrendChart';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ColorTrend {
  id: string;
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  analytics?: {
    dates: string[];
    values: number[];
  };
}

export default function ColorTrendsPage() {
  const [colorTrends, setColorTrends] = useState<ColorTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<ColorTrend | null>(null);

  useEffect(() => {
    const fetchColorTrends = async () => {
      try {
        const response = await fetch('/api/trends/colors');
        if (!response.ok) throw new Error('Failed to fetch color trends');
        const data = await response.json();
        setColorTrends(data);
      } catch (error) {
        toast.error('Failed to load color trends');
        console.error('Error fetching color trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColorTrends();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Color Trends</h1>
        <p className="text-muted-foreground">Explore trending colors and their popularity over time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colorTrends.map((trend) => (
          <div
            key={trend.id}
            className="group bg-[color:var(--card)] rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedTrend(trend)}
          >
            <div className="relative h-48">
              <Image
                src={trend.imageUrl}
                alt={trend.name}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0 opacity-75"
                style={{ backgroundColor: trend.hex }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-6 h-6 rounded-full border-2 border-[color:var(--color-white)]/20"
                  style={{ backgroundColor: trend.hex }}
                />
                <h3 className="text-lg font-semibold text-[color:var(--card-foreground)]">
                  {trend.name}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--muted-foreground)]">Popularity</span>
                  <span className="text-[color:var(--primary)] font-medium">{trend.popularity}%</span>
                </div>
                <div className="w-full bg-[color:var(--secondary)] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 transition-all duration-500 rounded-full"
                    style={{
                      width: `${trend.popularity}%`,
                      backgroundColor: trend.hex,
                      boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTrend} onOpenChange={() => setSelectedTrend(null)}>
        <DialogContent className="max-w-3xl">
          {selectedTrend && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-[color:var(--color-white)]/20"
                  style={{ backgroundColor: selectedTrend.hex }}
                />
                <h2 className="text-2xl font-bold">{selectedTrend.name}</h2>
              </div>

              {selectedTrend.analytics && (
                <div className="bg-[color:var(--card)] rounded-lg p-4">
                  <TrendChart
                    dates={selectedTrend.analytics.dates}
                    values={selectedTrend.analytics.values}
                    height={300}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[color:var(--card)] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Color Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--muted-foreground)]">Hex Code</span>
                      <span className="font-mono">{selectedTrend.hex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--muted-foreground)]">Current Popularity</span>
                      <span>{selectedTrend.popularity}%</span>
                    </div>
                  </div>
                </div>
                <div
                  className="bg-[color:var(--card)] rounded-lg p-4 flex items-center justify-center"
                  style={{ backgroundColor: selectedTrend.hex }}
                >
                  <span className="text-white text-lg font-semibold mix-blend-difference">
                    Color Preview
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
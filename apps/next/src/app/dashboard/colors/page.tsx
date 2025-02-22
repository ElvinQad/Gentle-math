'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ColorCard } from '@/components/ui/ColorCard';
import { ColorModal } from '@/components/ui/ColorModal';
import { type ColorTrend } from '@/types/colors';

export default function ColorTrendsPage() {
  const [colorTrends, setColorTrends] = useState<ColorTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<ColorTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearlyView, setIsYearlyView] = useState(false);

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Color Trends</h1>
        <p className="text-[color:var(--muted-foreground)]">
          Explore trending colors and their popularity over time
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colorTrends.map((trend) => (
          <ColorCard
            key={trend.id}
            trend={trend}
            onClick={() => setSelectedTrend(trend)}
          />
        ))}
      </div>

      <ColorModal
        trend={selectedTrend}
        isOpen={!!selectedTrend}
        onClose={() => setSelectedTrend(null)}
        isYearlyView={isYearlyView}
        onYearlyViewChange={setIsYearlyView}
      />
    </div>
  );
} 
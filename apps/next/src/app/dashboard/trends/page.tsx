import { TrendsGallery } from '@/components/dashboard/TrendsGallery'
import { ColorsGallery } from '@/components/dashboard/ColorsGallery'
import { trendingFashion, colorTrends } from '@/data/dashboardData'

export default function TrendsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trends Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Detailed analysis of current and emerging trends
        </p>
      </div>
      
      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Current Trends</h2>
        <TrendsGallery trends={trendingFashion} />
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Color Analysis</h2>
        <ColorsGallery colors={colorTrends} />
      </section>
    </div>
  )
}

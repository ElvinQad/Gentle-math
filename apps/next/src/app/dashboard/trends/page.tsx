import { TrendsGallery } from '@/components/dashboard/TrendsGallery'
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
      
     
        <TrendsGallery trends={trendingFashion} />

    </div>
  )
}

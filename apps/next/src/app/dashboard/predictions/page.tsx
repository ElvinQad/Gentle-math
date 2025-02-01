import { AdaptationsGallery } from '@/components/dashboard/AdaptationsGallery'
import { adaptations } from '@/data/dashboardData'

export default function PredictionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Predictions</h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered forecasts and future trends
        </p>
      </div>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Future Trends</h2>
        <AdaptationsGallery adaptations={adaptations} />
      </section>
    </div>
  )
}

import { ChartShowcase } from '@/components/dashboard/ChartShowcase'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Recharts Components</h1>
        <p className="text-foreground-secondary mt-2">Available chart types from Recharts library</p>
      </header>

      <ChartShowcase />
    </div>
  )
}
interface ActivityStatsProps {
  stats: {
    last24Hours: number
    lastWeek: number
    lastMonth: number
    total: number
  }
}

export function ActivityStats({ stats }: ActivityStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last 24 Hours</div>
        <div className="text-2xl font-bold">{stats.last24Hours}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last Week</div>
        <div className="text-2xl font-bold">{stats.lastWeek}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Last Month</div>
        <div className="text-2xl font-bold">{stats.lastMonth}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground">Total Activities</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </div>
    </div>
  )
} 
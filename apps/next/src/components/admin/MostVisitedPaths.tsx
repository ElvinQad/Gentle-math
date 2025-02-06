interface MostVisitedPathsProps {
  paths: [string, number][]
}

export function MostVisitedPaths({ paths }: MostVisitedPathsProps) {
  function formatPath(path: string): string {
    if (!path || path === 'unknown') return 'Unknown Path'
    if (path === 'home') return 'Home Page'
    return path.split('/').map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' / ')
  }

  return (
    <div className="bg-card p-4 rounded-lg border mb-6">
      <h4 className="text-sm font-semibold mb-3">Most Visited Paths</h4>
      <div className="space-y-2">
        {paths.map(([path, count]) => (
          <div key={path} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{formatPath(path)}</span>
            <span className="text-sm font-medium">{count} visits</span>
          </div>
        ))}
      </div>
    </div>
  )
} 
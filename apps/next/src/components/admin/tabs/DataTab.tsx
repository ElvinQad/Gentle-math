import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trend } from '@/types/admin';

interface DataTabProps {
  formData: {
    spreadsheetUrl: string;
  };
  setFormData: (data: { spreadsheetUrl: string }) => void;
  selectedTrend: Trend | null;
  isProcessingSpreadsheet: boolean;
  onProcessSpreadsheet: () => Promise<void>;
  isEditMode: boolean;
}

export function DataTab({
  formData,
  setFormData,
  selectedTrend,
  isProcessingSpreadsheet,
  onProcessSpreadsheet,
  isEditMode,
}: DataTabProps) {
  const chartData = selectedTrend?.analytics?.[0]
    ? selectedTrend.analytics[0].dates.map((date, i) => ({
        month: new Date(date).toISOString().slice(0, 7),
        actual: selectedTrend.analytics[0].values[i],
        forecast: selectedTrend.analytics[0].values[i],
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="spreadsheet" className="text-sm font-medium text-[color:var(--muted-foreground)]">
          Google Spreadsheet URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="spreadsheet"
            type="url"
            value={formData.spreadsheetUrl}
            onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
            placeholder="Enter Google Spreadsheet URL"
            className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
              focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
          />
          {isEditMode && (
            <Button
              type="button"
              onClick={onProcessSpreadsheet}
              disabled={isProcessingSpreadsheet || !formData.spreadsheetUrl}
              className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)]
                hover:bg-[color:var(--primary)]/90 disabled:opacity-50"
            >
              {isProcessingSpreadsheet ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Process Data'
              )}
            </Button>
          )}
        </div>
        <div className="text-sm space-y-1">
          <p className="text-[color:var(--muted-foreground)]">
            The spreadsheet should have &apos;trend&apos; and &apos;date&apos; columns
          </p>
          <p className="text-[color:var(--color-warm-orange)] dark:text-[color:var(--color-warm-orange)]/90">
            Note: You must be signed in with Google to process spreadsheet data. If you&apos;re using regular login, 
            you&apos;ll need to sign out and sign in with Google first.
          </p>
        </div>
      </div>

      {/* Data Preview */}
      {chartData.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">Data Preview</Label>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[color:var(--border)]">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[color:var(--muted-foreground)]">Month</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[color:var(--muted-foreground)]">Actual</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[color:var(--muted-foreground)]">Forecast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {chartData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">
                      {new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">{data.actual ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">{data.forecast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              className="w-full h-[300px]"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.1}
                activeDot={{ r: 8 }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="var(--accent)"
                fill="var(--accent)"
                fillOpacity={0.1}
              />
            </AreaChart>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Historical Data Points</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {chartData.filter(d => d.actual !== null).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Forecast Points</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {chartData.filter(d => d.actual === null).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Maximum Value</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {Math.max(...chartData.map(d => d.actual ?? 0))}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Average Value</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {(chartData.reduce((sum, d) => sum + (d.actual ?? 0), 0) / chartData.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
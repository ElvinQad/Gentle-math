import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trend } from '@/types/admin';
import { RequestSheetsAccess } from '@/components/admin/RequestSheetsAccess';
import { useSession } from 'next-auth/react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  actual?: number;
  predicted?: number;
}

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
  const { data: session } = useSession();
  
  const rawChartData: ChartDataPoint[] = selectedTrend?.analytics?.[0]?.dates
    ? selectedTrend.analytics[0].dates.map((dateStr: string, i: number) => {
        const currentDate = new Date(dateStr);
        const now = new Date();
        const isCurrentMonth = currentDate.getMonth() === now.getMonth() && 
                             currentDate.getFullYear() === now.getFullYear();
        const isPredicted = currentDate > now;
        const value = selectedTrend.analytics?.[0]?.values[i] ?? 0;

        return {
          date: currentDate.toISOString().slice(0, 7),
          displayDate: currentDate.toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric'
          }),
          actual: isCurrentMonth || !isPredicted ? value : undefined,
          predicted: isPredicted || isCurrentMonth ? value : undefined,
        };
      })
    : [];

  const chartData = rawChartData;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-[color:var(--foreground)]">Analytics Data</h3>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Connect a Google Spreadsheet to visualize trend data
            </p>
          </div>
          <RequestSheetsAccess />
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label 
              htmlFor="spreadsheet"
              className="text-sm font-medium text-[color:var(--muted-foreground)]"
            >
              Google Spreadsheet URL
            </Label>
            <Input
              id="spreadsheet"
              type="url"
              value={formData.spreadsheetUrl}
              onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
              placeholder="Enter Google Spreadsheet URL"
              className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
                focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
            />
            <p className="text-sm text-[color:var(--muted-foreground)]">
              The spreadsheet should have &apos;trend&apos; and &apos;date&apos; columns
            </p>
            {!session?.accessToken && (
              <p className="text-[color:var(--color-warm-orange)] dark:text-[color:var(--color-warm-orange)]/90">
                Please connect your Google account using the button above to access spreadsheet data.
              </p>
            )}
          </div>

          {formData.spreadsheetUrl && isEditMode && (
            <Button
              type="button"
              onClick={onProcessSpreadsheet}
              disabled={isProcessingSpreadsheet || !formData.spreadsheetUrl || !session?.accessToken}
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
                  <th className="px-4 py-2 text-left text-sm font-medium text-[color:var(--muted-foreground)]">Predicted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {chartData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">
                      {data.displayDate}
                    </td>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">{data.actual ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-[color:var(--foreground)]">{data.predicted ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-soft-blue)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-soft-blue)" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-muted-green)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-muted-green)" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(value: ValueType, name: NameType) => [`${value}%`, name]}
                    labelFormatter={(date) => date}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <ReferenceLine
                    x={new Date().toISOString().slice(0, 7)}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    label={{
                      value: 'Current',
                      position: 'top',
                      fill: 'var(--muted-foreground)',
                      fontSize: 12
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual"
                    stroke="var(--color-soft-blue)"
                    strokeWidth={2}
                    fill="url(#actualGradient)"
                    isAnimationActive={true}
                    animationDuration={1000}
                    dot={{ fill: 'var(--color-soft-blue)', r: 2 }}
                    activeDot={{ r: 4, strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted"
                    stroke="var(--color-muted-green)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#predictedGradient)"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationBegin={1000}
                    dot={{ fill: 'var(--color-muted-green)', r: 2 }}
                    activeDot={{ r: 4, strokeWidth: 1 }}
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Historical Data Points</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {chartData.filter(d => d.actual !== undefined).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Forecast Points</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {chartData.filter(d => d.actual === undefined).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Maximum Value</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {Math.max(...chartData.map(d => d.actual ?? d.predicted ?? 0))}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Average Value</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                {(chartData.reduce((sum, d) => sum + (d.actual ?? d.predicted ?? 0), 0) / chartData.length).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
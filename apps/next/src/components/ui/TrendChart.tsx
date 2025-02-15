import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface TrendChartProps {
  dates: (string | Date)[];
  values: number[];
  height?: number | string;
  isYearlyView?: boolean;
  ageSegments?: Array<{ name: string; value: number }>;
}

export function TrendChart({ dates, values, height = 300, isYearlyView = false }: TrendChartProps) {
  const processData = (dates: (string | Date)[], values: number[], isYearly: boolean) => {
    const rawData = dates.map((date, i) => {
      const now = new Date();
      const currentDate = date instanceof Date ? date : new Date(date);
      const isCurrentMonth = currentDate.getMonth() === now.getMonth() && 
                           currentDate.getFullYear() === now.getFullYear();
      const isPredicted = currentDate > now;
      const value = Number(values[i]);
      
      // Remove unused isTransitionPoint
      return {
        date: currentDate.toISOString().slice(0, 7),
        displayDate: currentDate.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric'
        }),
        actual: isCurrentMonth || !isPredicted ? value : undefined,
        predicted: isPredicted || isCurrentMonth ? value : undefined,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      };
    });

    if (isYearly) {
      // Group by year and calculate averages
      const yearlyData = rawData.reduce((acc, item) => {
        const year = item.year;
        if (!acc[year]) {
          acc[year] = {
            actual: { sum: 0, count: 0 },
            predicted: { sum: 0, count: 0 },
            date: `${year}-01`,
            displayDate: year.toString(),
          };
        }
        if (item.actual !== undefined) {
          acc[year].actual.sum += item.actual;
          acc[year].actual.count++;
        }
        if (item.predicted !== undefined) {
          acc[year].predicted.sum += item.predicted;
          acc[year].predicted.count++;
        }
        return acc;
      }, {} as Record<number, {
        actual: { sum: number; count: number };
        predicted: { sum: number; count: number };
        date: string;
        displayDate: string;
      }>);

      return Object.values(yearlyData)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(yearData => ({
          date: yearData.date,
          displayDate: yearData.displayDate,
          actual: yearData.actual.count > 0 ? yearData.actual.sum / yearData.actual.count : undefined,
          predicted: yearData.predicted.count > 0 ? yearData.predicted.sum / yearData.predicted.count : undefined,
        }));
    }

    return rawData;
  };

  const chartData = processData(dates, values, isYearlyView);

  return (
    <div style={{ height, width: '100%' }}>
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
            tickFormatter={(date) => isYearlyView ? date : date}
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
            formatter={(value: ValueType, name: NameType, entry: { payload?: { date?: string; predicted?: number } }) => {
              const payload = entry?.payload;
              if (!payload) return [null, null];
              
              const now = new Date();
              const itemDate = new Date(payload.date ?? '');
              const isCurrentMonth = itemDate.getMonth() === now.getMonth() && 
                                   itemDate.getFullYear() === now.getFullYear();
              
              if (isCurrentMonth) {
                if (name === 'actual') return [null, null];
                return [`${value}%`, 'Value'];
              }
              
              if (payload.predicted !== undefined && !isCurrentMonth) {
                if (name === 'actual') return [null, null];
                return [`${value}%`, 'Predicted'];
              }
              
              return [`${value}%`, 'Actual'];
            }}
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
  );
} 
'use client'

import { useTheme } from 'next-themes'
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Brush,
  ReferenceLine,
} from 'recharts'

interface DataPoint {
  name: string;
  value: number;
  value2?: number;
  count?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}



export function ChartShowcase() {
  const { theme } = useTheme()
  const primaryColor = theme === 'dark' ? '#8884d8' : '#6366f1'
  const secondaryColor = theme === 'dark' ? '#82ca9d' : '#10b981'

  const timeSeriesData: DataPoint[] = [
    { name: 'Jan', value: 400, value2: 300 },
    { name: 'Feb', value: 300, value2: 250 },
    { name: 'Mar', value: 600, value2: 450 },
    { name: 'Apr', value: 200, value2: 180 },
    { name: 'May', value: 500, value2: 400 },
    { name: 'Jun', value: 350, value2: 280 },
  ]

  const pieData = [
    { name: 'Desktop', value: 400, color: primaryColor },
    { name: 'Mobile', value: 300, color: secondaryColor },
    { name: 'Tablet', value: 300, color: '#f59e0b' },
    { name: 'Others', value: 200, color: '#ef4444' },
  ]

  const radarData = [
    { subject: 'Speed', A: 120, B: 110 },
    { subject: 'Quality', A: 98, B: 130 },
    { subject: 'Comfort', A: 86, B: 130 },
    { subject: 'Price', A: 99, B: 100 },
    { subject: 'Style', A: 85, B: 90 },
    { subject: 'Durability', A: 65, B: 85 },
  ]

  const funnelData = [
    { name: 'Leads', value: 1000 },
    { name: 'Prospects', value: 750 },
    { name: 'Opportunities', value: 500 },
    { name: 'Deals', value: 250 },
  ]

  const treeMapData = [
    { name: 'A', value: 400, color: primaryColor },
    { name: 'B', value: 300, color: secondaryColor },
    { name: 'C', value: 200, color: '#f59e0b' },
    { name: 'D', value: 100, color: '#ef4444' },
  ]

  const composedData = timeSeriesData.map(item => ({
    ...item,
    count: Math.round(item.value * 0.3)
  }))

  const scatterData = [
    { x: 100, y: 200, z: 200, name: 'Group A' },
    { x: 120, y: 100, z: 260, name: 'Group B' },
    { x: 170, y: 300, z: 400, name: 'Group C' },
    { x: 140, y: 250, z: 280, name: 'Group D' },
    { x: 150, y: 400, z: 500, name: 'Group E' },
    { x: 110, y: 280, z: 200, name: 'Group F' },
  ]

  const barData = [
    { name: 'Q1', value: 4000, target: 4500, previous: 3800 },
    { name: 'Q2', value: 3000, target: 3500, previous: 2900 },
    { name: 'Q3', value: 2000, target: 2400, previous: 1800 },
    { name: 'Q4', value: 2780, target: 3000, previous: 2600 },
  ]

  const radialBarData = [
    { name: '18-24', value: 31, fill: primaryColor },
    { name: '25-29', value: 26, fill: secondaryColor },
    { name: '30-34', value: 18, fill: '#f59e0b' },
    { name: '35+', value: 25, fill: '#ef4444' },
  ]

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Line Chart with Brush</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Brush dataKey="name" height={30} stroke={primaryColor} />
              <ReferenceLine y={350} stroke="red" strokeDasharray="3 3" label="Goal" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Composed Chart</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={composedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="value"
                fill={primaryColor}
                stroke={primaryColor}
                fillOpacity={0.3}
              />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill={secondaryColor}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value2"
                stroke="#ff7300"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  )
}

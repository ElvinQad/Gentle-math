'use client'

import { useTheme } from 'next-themes'
import {
  LineChart,
  Line,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  ComposedChart,
  Brush,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
  Rectangle,
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

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Advanced Pie Chart</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
              outerRadius={100}
                          
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Interactive Radar Chart</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke={primaryColor} opacity={0.3} />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                name="Series A"
                dataKey="A"
                stroke={primaryColor}
                fill={primaryColor}
                fillOpacity={0.6}
                label
              />
              <Radar
                name="Series B"
                dataKey="B"
                stroke={secondaryColor}
                fill={secondaryColor}
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Funnel Chart</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={funnelData}
                fill={primaryColor}
                isAnimationActive
              >
                <LabelList 
                  position="right" 
                  fill="#fff" 
                  stroke="none"
                  fontSize={14}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">TreeMap</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeMapData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill={primaryColor}
            >
              <Tooltip content={<CustomTooltip />} />
              <LabelList dataKey="name" position="center" />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Area Chart</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={primaryColor}
                fill="url(#areaGradient)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="value2"
                stroke={secondaryColor}
                fill={secondaryColor}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Advanced Scatter Chart</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Performance" 
                unit="%" 
                domain={['auto', 'auto']}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Score" 
                unit="pt"
                domain={[0, 500]}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend />
              <Scatter
                name="Results"
                data={scatterData}
                fill={primaryColor}
                line={{ stroke: primaryColor, strokeWidth: 2 }}
                shape="circle"
              >
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={primaryColor}
                    opacity={0.7 + (index * 0.05)}
                  />
                ))}
                <LabelList dataKey="name" position="top" />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Multi-Series Bar Chart</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={primaryColor}
                radius={[4, 4, 0, 0]}
                barSize={20}
                shape={<Rectangle />}
              >
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={primaryColor}
                    opacity={0.7 + (index * 0.1)}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="target" 
                fill={secondaryColor}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey="previous" 
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                barSize={20}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-6">Radial Bar Chart</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="20%"
              outerRadius="90%"
              data={radialBarData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 40]} />
              <RadialBar dataKey="value" label={{ position: 'insideStart', fill: '#fff' }} background />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

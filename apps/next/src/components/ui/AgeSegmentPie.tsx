'use client';

import { useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

interface AgeSegmentData {
  name: string;
  value: number;
}

interface AgeSegmentPieProps {
  data: AgeSegmentData[];
  height?: number | string;
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text 
        x={cx} 
        y={cy} 
        dy={8} 
        textAnchor="middle" 
        fill="var(--foreground)"
        className="text-sm font-medium"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="var(--foreground)"
        className="text-sm"
      >
        {payload.name}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={18} 
        textAnchor={textAnchor} 
        fill="var(--muted-foreground)"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export function AgeSegmentPie({ data, height = 300 }: AgeSegmentPieProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const colors = [
    'var(--color-soft-blue)',
    'var(--color-muted-green)',
    'var(--color-warm-orange)',
    'var(--color-subtle-red)',
    'var(--color-teal)',
    'var(--color-lavender)',
  ];

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill={colors[0]}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            stroke="var(--background)"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 
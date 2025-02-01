'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { type ColorTrend } from '@/types/dashboard'

const dummyData = [
  { name: 'Spring', value: 4000, forecast: 4400 },
  { name: 'Summer', value: 3000, forecast: 3300 },
  { name: 'Fall', value: 2000, forecast: 2200 },
  { name: 'Winter', value: 2780, forecast: 3000 },
]

interface ColorsGalleryProps {
  colors: ColorTrend[]
}

export function ColorsGallery({ colors }: ColorsGalleryProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {colors.map((color) => (
          <div 
            key={color.id} 
            className="bg-background-secondary rounded-lg p-4 transition-transform hover:scale-105"
            onClick={() => setSelectedColor(color.name)}
          >
            <div 
              className="w-full h-24 rounded-md mb-3" 
              style={{ backgroundColor: color.hex }}
            />
            <div className="space-y-2">
              <h3 className="font-medium text-sm">{color.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground-secondary">{color.hex}</span>
                <span className="font-medium">{color.popularity}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-accent-foreground h-1.5 rounded-full transition-all" 
                  style={{ width: `${color.popularity}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedColor ? (
        <div className="bg-white dark:bg-dark-200 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Color Analysis: {selectedColor}</h3>
          <BarChart width={500} height={300} data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="hsl(var(--primary))" name="Usage" />
            <Bar dataKey="forecast" fill="hsl(var(--accent-foreground))" name="Forecast" />
          </BarChart>
          <div className="mt-4">
            <h4 className="font-semibold mb-2 dark:text-gray-100">Insights</h4>
            <p className="text-gray-600 dark:text-gray-300">
              This color shows increasing popularity in upcoming seasons, particularly in casual wear.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-dark-300 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Select a color to view analysis</p>
        </div>
      )}
    </div>
  )
}
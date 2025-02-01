'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { type Adaptation } from '@/types/dashboard'

const dummyData = [
  { month: 'Jan', streetwear: 65, luxury: 45, casual: 80 },
  { month: 'Feb', streetwear: 70, luxury: 50, casual: 75 },
  { month: 'Mar', streetwear: 75, luxury: 55, casual: 70 },
  { month: 'Apr', streetwear: 80, luxury: 60, casual: 65 },
  { month: 'May', streetwear: 85, luxury: 65, casual: 60 },
  { month: 'Jun', streetwear: 90, luxury: 70, casual: 55 },
]

const adaptationCategories = [
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Urban fashion trends adapted for mainstream appeal',
    color: 'hsl(var(--primary))'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'High-end fashion elements adapted for ready-to-wear',
    color: 'hsl(var(--accent-foreground))'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Everyday wear with contemporary fashion influences',
    color: 'hsl(var(--muted-foreground))'
  }
]

interface AdaptationsGalleryProps {
  adaptations?: Adaptation[]
  isLoading?: boolean
}

export function AdaptationsGallery({ 
  adaptations = [], 
  isLoading = false 
}: AdaptationsGalleryProps) {
  if (isLoading) {
    return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48" />
      ))}
    </div>
  }

  if (!adaptations?.length) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg">
        <p className="text-foreground-secondary">No adaptations available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adaptations.map((item) => (
        <div key={item.id} className="bg-background-secondary rounded-lg p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <ImpactBadge impact={item.impact} />
          </div>
          <p className="text-foreground-secondary mb-4">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">Adoption Rate</span>
            <span className="text-lg font-semibold">{item.adoption}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-accent-foreground h-2 rounded-full transition-all" 
              style={{ width: item.adoption }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors = {
    High: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[impact as keyof typeof colors]}`}>
      {impact}
    </span>
  )
}
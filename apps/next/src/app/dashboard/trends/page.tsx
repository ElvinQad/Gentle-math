'use client'

import { useEffect, useState } from 'react'
import { TrendsGallery } from '@/components/dashboard/TrendsGallery'
import { type Trend } from '@/types/dashboard'

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/admin/trends')
        if (!response.ok) throw new Error('Failed to fetch trends')
        const data = await response.json()
        setTrends(data)
      } catch (error) {
        console.error('Error fetching trends:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <TrendsGallery trends={trends} isLoading={isLoading} />
    </div>
  )
}

export interface Trend {
  id: number
  title: string
  image: string
  views: number
  likes: number
  data: {
    month: string
    actual: number | null
    forecast: number
  }[]
}

export interface ColorTrend {
  id: number
  name: string
  hex: string
  popularity: number
}

export interface Adaptation {
  id: number
  title: string
  description: string
  impact: string
  adoption: string
}
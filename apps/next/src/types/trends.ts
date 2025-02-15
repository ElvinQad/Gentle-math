export interface Trend {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrls: string[];
  mainImageIndex: number;
  createdAt: string;
  updatedAt: string;
  spreadsheetUrl?: string;
  analytics?: Array<{
    dates: string[];
    values: number[];
    ageSegments?: Array<{
      name: string;
      value: number;
    }>;
  }>;
}

export interface ImagePreview {
  url: string;
  isMain: boolean;
}

export const TREND_TYPES = [
  { value: 'Fashion', label: 'Fashion & Style' },
  { value: 'Technology', label: 'Technology & Innovation' },
  { value: 'Lifestyle', label: 'Lifestyle & Wellness' },
  { value: 'Business', label: 'Business & Economy' },
  { value: 'Entertainment', label: 'Entertainment & Media' },
  { value: 'Education', label: 'Education & Learning' },
  { value: 'Health', label: 'Health & Fitness' },
  { value: 'Travel', label: 'Travel & Adventure' },
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Sports', label: 'Sports & Recreation' }
] as const;

export type TrendType = typeof TREND_TYPES[number]['value']; 
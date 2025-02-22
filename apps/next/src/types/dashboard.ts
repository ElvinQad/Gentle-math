import { Analytics } from './admin';

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
  isRestricted?: boolean;
  analytics?: Analytics[];
  data?: Array<{
    month: string;
    actual: number | null;
    forecast: number;
  }>;
}

export interface ColorTrend {
  id: number;
  name: string;
  hex: string;
  popularity: number;
}

export interface Adaptation {
  id: number;
  title: string;
  description: string;
  impact: string;
  adoption: string;
}

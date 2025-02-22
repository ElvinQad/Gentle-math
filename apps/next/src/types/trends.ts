export interface Analytics {
  id: string;
  dates: string[];
  values: number[];
  ageSegments?: Array<{
    name: string;
    value: number;
  }>;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrls: string[];
  mainImageIndex: number;
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  analytics?: Analytics[];
  isRestricted: boolean;
}

export interface ImagePreview {
  url: string;
  isMain: boolean;
}


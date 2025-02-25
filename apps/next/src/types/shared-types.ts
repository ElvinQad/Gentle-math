// Base interfaces for common patterns
export interface BaseEntity {
  id: string;
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: string;
  updatedAt?: string;
}

// Data Models
export interface Analytics extends BaseEntity {
  dates: string[];
  values: number[];
  ageSegments?: Array<{
    name: string;
    value: number;
  }>;
}

export interface BaseTrend extends TimestampedEntity {
  title: string;
  description: string;
  type: string;
  imageUrls: string[];
  mainImageIndex: number;
  spreadsheetUrl?: string;
  analytics?: Analytics[];
  isRestricted?: boolean;
}

export interface TrendData {
  month: string;
  actual: number | null;
  forecast: number;
}

export interface BaseColorTrend extends TimestampedEntity {
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  analytics?: Analytics;
  isRestricted: boolean;
  palette1?: string | null;
  palette2?: string | null;
  palette3?: string | null;
  palette4?: string | null;
  palette5?: string | null;
}

// User-related base interfaces
export interface BaseUser extends TimestampedEntity {
  name: string | null;
  email: string | null;
}

export interface BaseUserActivity extends BaseEntity {
  type: string;
  timestamp: string;
  metadata?: Record<string, string | undefined>;
}

export interface BaseUserSession extends BaseEntity {
  expires: string;
  lastUsed: string;
}

export interface BaseUserAccount {
  provider: string;
  type: string;
  providerAccountId: string;
  expiresAt: string | null;
}

// Component Props Types
export interface ImagePreview {
  url: string;
  isMain: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  children: Category[];
}

export interface Breadcrumb extends BaseEntity {
  name: string;
}

// Form Data Types
export interface BaseTrendFormData {
  title: string;
  description: string;
  spreadsheetUrl: string;
  categoryId: string;
  imageUrls: string[];
  mainImageIndex: number;
}

export interface BaseColorFormData {
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  spreadsheetUrl: string;
  palette1?: string;
  palette2?: string;
  palette3?: string;
  palette4?: string;
  palette5?: string;
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  displayDate: string;
  actual?: number;
  predicted?: number;
}

export interface AgeSegmentData {
  name: string;
  value: number;
}

// UI Component Props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}

export interface SubscriptionRequiredProps {
  title?: string;
  description?: string;
  features?: string[];
  className?: string;
} 
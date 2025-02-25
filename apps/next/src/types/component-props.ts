import type { 
  Category, 
  ImagePreview, 
  AgeSegmentData,
  BaseTrendFormData
} from './shared-types';
import type { UserActivity } from './admin';
import type { ColorTrend } from './colors';
import type { Trend } from './dashboard';

export interface ActivityStatsProps {
  stats: {
    last24Hours: number;
    lastWeek: number;
    lastMonth: number;
    total: number;
  };
}

export interface ActivityTimelineProps {
  activities: UserActivity[];
}

export interface DetailsTabProps {
  formData: Pick<BaseTrendFormData, 'title' | 'description' | 'categoryId'>;
  setFormData: (data: Partial<BaseTrendFormData>) => void;
}

export interface ImagesTabProps {
  imageUrls: ImagePreview[];
  setImageUrls: (urls: ImagePreview[]) => void;
  onFileUpload: (files: File[]) => Promise<void>;
}

export interface DataTabProps {
  formData: Pick<BaseTrendFormData, 'spreadsheetUrl'>;
  setFormData: (data: Pick<BaseTrendFormData, 'spreadsheetUrl'>) => void;
  selectedTrend: Trend | null;
  isProcessingSpreadsheet: boolean;
  onProcessSpreadsheet: () => Promise<void>;
  isEditMode: boolean;
}

export interface ColorCardProps {
  trend: ColorTrend;
  onClick?: () => void;
  showCreatedDate?: boolean;
  className?: string;
}

export interface CategoryViewerProps {
  categories: Category[];
}

export interface TrendChartProps {
  dates: (string | Date)[];
  values: number[];
  height?: number | string;
  isYearlyView?: boolean;
  ageSegments?: AgeSegmentData[];
}

export interface AgeSegmentPieProps {
  data: AgeSegmentData[];
  height?: number | string;
}

export interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export interface MostVisitedPathsProps {
  paths: [string, number][];
} 
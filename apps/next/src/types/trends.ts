import { Analytics, BaseTrend, ImagePreview } from './shared-types';

export type { Analytics, ImagePreview };

export interface Trend extends BaseTrend {
  categoryId?: string | null;
  isRestricted: boolean;
}


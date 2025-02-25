import { BaseTrend, TrendData, BaseColorTrend } from './shared-types';

export interface Trend extends BaseTrend {
  data?: TrendData[];
}

export type ColorTrend = BaseColorTrend;


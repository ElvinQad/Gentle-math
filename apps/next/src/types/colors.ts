export interface ColorTrend {
  id: string;
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  palette1?: string;
  palette2?: string;
  palette3?: string;
  palette4?: string;
  palette5?: string;
  analytics?: {
    dates: string[];
    values: number[];
  };
  createdAt?: string;
  isRestricted: boolean;
} 
export interface UserSession {
  id: string;
  expires: string;
  lastUsed: string;
}

export interface UserAccount {
  provider: string;
  type: string;
  providerAccountId: string;
  expiresAt: string | null;
}

export interface UserActivity {
  id: string;
  type: string;
  timestamp: string;
  metadata: {
    path?: string;
    userAgent?: string;
    forwardedFor?: string;
  };
}

export interface UserDetails {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    createdAt: string;
    lastActive: string | null;
    isActive: boolean;
    status: 'online' | 'away' | 'inactive' | 'offline';
  };
  activities: {
    recent: UserActivity[];
    byDate: Record<string, UserActivity[]>;
    stats: {
      last24Hours: number;
      lastWeek: number;
      lastMonth: number;
      total: number;
      mostVisitedPaths: [string, number][];
      browsers: [string, number][];
      activityByHour: Array<{ hour: number; count: number }>;
    };
  };
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  createdAt: string;
  subscribedUntil: string | null;
}

export interface TrendData {
  month: string;
  actual: number | null;
  forecast: number;
}

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
  spreadsheetUrl?: string;
  analytics?: Analytics[];
}

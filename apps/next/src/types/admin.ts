import { 
  Analytics, 
  BaseTrend, 
  TrendData, 
  BaseUser, 
  BaseUserActivity,
  BaseUserSession,
  BaseUserAccount 
} from './shared-types';

export type UserSession = BaseUserSession;

export type UserAccount = BaseUserAccount;

export interface UserActivity extends BaseUserActivity {
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

export interface User extends BaseUser {
  isAdmin: boolean;
  subscribedUntil: string | null;
}

export type { Analytics, TrendData };

export type Trend = BaseTrend;

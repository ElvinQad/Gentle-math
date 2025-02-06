import { User } from '@prisma/client';

type ExtendedUser = User & {
  isAdmin?: boolean;
  subscribedUntil?: Date | null;
}

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  subscribedUntil?: string | Date | null;
}

type UserType = ExtendedUser | SessionUser;

/**
 * Checks if a user has admin privileges
 */
export function isUserAdmin(user: UserType | null | undefined): boolean {
  if (!user) return false;
  return user.isAdmin ?? false;
}

/**
 * Checks if a user has an active subscription
 */
export function hasActiveSubscription(user: UserType | null | undefined): boolean {
  if (!user || !user.subscribedUntil) return false;
  return new Date(user.subscribedUntil) > new Date();
}

/**
 * Gets the number of days remaining in the subscription
 * Returns -1 if no active subscription
 */
export function getSubscriptionDaysRemaining(user: UserType | null | undefined): number {
  if (!user || !user.subscribedUntil) return -1;
  const now = new Date();
  const subscriptionEnd = new Date(user.subscribedUntil);
  if (subscriptionEnd <= now) return -1;
  
  const diffTime = subscriptionEnd.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats the subscription end date into a human-readable string
 */
export function formatSubscriptionEndDate(user: UserType | null | undefined): string {
  if (!user || !user.subscribedUntil) return 'No active subscription';
  return new Date(user.subscribedUntil).toLocaleDateString();
} 
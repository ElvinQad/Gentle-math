import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function isUserSubscribed(): Promise<boolean> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.subscribedUntil) return false;
  return new Date(session.user.subscribedUntil) > new Date();
}

export function isSubscriptionValid(subscribedUntil: string | null | undefined): boolean {
  if (!subscribedUntil) return false;
  return new Date(subscribedUntil) > new Date();
}

export function getSubscriptionStatus(subscribedUntil: string | null | undefined): {
  isSubscribed: boolean;
  expiryDate: Date | null;
} {
  if (!subscribedUntil) {
    return {
      isSubscribed: false,
      expiryDate: null,
    };
  }

  const expiryDate = new Date(subscribedUntil);
  return {
    isSubscribed: expiryDate > new Date(),
    expiryDate,
  };
} 
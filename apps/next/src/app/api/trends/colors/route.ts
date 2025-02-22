import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { isSubscriptionValid } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const isSubscribed = isSubscriptionValid(session?.user?.subscribedUntil);

    const colorTrends = await prisma.colorTrend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        analytics: true,
      },
    });

    // Transform the data to include subscription status
    const transformedTrends = colorTrends.map(trend => ({
      ...trend,
      isRestricted: !isSubscribed,
      // If user is not subscribed, remove sensitive analytics data
      analytics: isSubscribed ? trend.analytics : trend.analytics ? {
        ...trend.analytics,
        values: trend.analytics.values.map(() => 0), // Replace actual values with zeros
        ageSegments: null,
      } : null,
    }));

    return NextResponse.json(transformedTrends);
  } catch (error) {
    console.error('Failed to fetch color trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch color trends' },
      { status: 500 }
    );
  }
} 
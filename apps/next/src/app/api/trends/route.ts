import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { isSubscriptionValid } from '@/lib/subscription';
import { type Trend, type Analytics } from '@/types/trends';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const isSubscribed = isSubscriptionValid(session?.user?.subscribedUntil);

    const trends = await prisma.trend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        analytics: true,
      },
    });

    // Transform the data to include subscription status
    const transformedTrends: Trend[] = trends.map(trend => ({
      id: trend.id,
      title: trend.title,
      description: trend.description,
      type: trend.type,
      imageUrls: trend.imageUrls,
      mainImageIndex: trend.mainImageIndex,
      createdAt: trend.createdAt.toISOString(),
      updatedAt: trend.updatedAt.toISOString(),
      categoryId: trend.categoryId,
      isRestricted: !isSubscribed,
      analytics: isSubscribed && trend.analytics ? [{
        id: trend.analytics.id,
        dates: trend.analytics.dates.map(d => d.toISOString()),
        values: trend.analytics.values,
        ageSegments: trend.analytics.ageSegments as Analytics['ageSegments'],
      }] : undefined,
    }));

    return NextResponse.json(transformedTrends);
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
} 
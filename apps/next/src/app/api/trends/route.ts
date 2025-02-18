import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const isSubscribed = session?.user?.subscribedUntil && new Date(session.user.subscribedUntil) > new Date();

    const trends = await prisma.trend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        analytics: true,
      },
    });

    // If user is not subscribed, limit to 3 trends
    if (!isSubscribed) {
      return NextResponse.json(trends.slice(0, 3));
    }

    return NextResponse.json(trends);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch trends:', { message: errorMessage });
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
} 
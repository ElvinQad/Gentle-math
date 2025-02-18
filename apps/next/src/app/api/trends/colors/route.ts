import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const isSubscribed = session?.user?.subscribedUntil && new Date(session.user.subscribedUntil) > new Date();

    const colorTrends = await prisma.colorTrend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        analytics: true,
      },
    });

    // If user is not subscribed, limit to 3 color trends
    if (!isSubscribed) {
      return NextResponse.json(colorTrends.slice(0, 3));
    }

    return NextResponse.json(colorTrends);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch color trends:', { message: errorMessage });
    return NextResponse.json({ error: 'Failed to fetch color trends' }, { status: 500 });
  }
} 
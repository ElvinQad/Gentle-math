import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const colorTrends = await prisma.colorTrend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        analytics: true,
      },
    });

    return NextResponse.json(colorTrends);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch color trends:', { message: errorMessage });
    return NextResponse.json({ error: 'Failed to fetch color trends' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.hex || !data.imageUrl || typeof data.popularity !== 'number') {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Name, hex color, image URL, and popularity are required'
      }, { status: 400 });
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(data.hex)) {
      return NextResponse.json({
        error: 'Invalid hex color',
        message: 'Hex color must be in format #RRGGBB or #RGB'
      }, { status: 400 });
    }

    // Validate popularity range
    if (data.popularity < 0 || data.popularity > 100) {
      return NextResponse.json({
        error: 'Invalid popularity value',
        message: 'Popularity must be between 0 and 100'
      }, { status: 400 });
    }

    // Verify image URL is accessible
    try {
      const imageResponse = await fetch(data.imageUrl, { method: 'HEAD' });
      if (!imageResponse.ok) {
        return NextResponse.json({
          error: 'Invalid image URL',
          message: 'The provided image URL is not accessible'
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid image URL',
        message: `Failed to verify image URL accessibility: ${error}`
      }, { status: 400 });
    }

    // Generate sample analytics data for the past 12 months
    const now = new Date();
    const dates = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(now.getMonth() - (11 - i));
      return date;
    });

    // Generate random values between popularity/2 and popularity
    const baseValue = data.popularity / 2;
    const values = dates.map(() => 
      Math.floor(baseValue + Math.random() * (data.popularity - baseValue))
    );

    // Create the color trend with analytics
    const colorTrend = await prisma.colorTrend.create({
      data: {
        name: data.name,
        hex: data.hex,
        imageUrl: data.imageUrl,
        popularity: data.popularity,
        analytics: {
          create: {
            dates,
            values,
          },
        },
      },
      include: {
        analytics: true,
      },
    });

    return NextResponse.json(colorTrend);
  } catch (error) {
    console.error('Failed to create color trend:', error);
    return NextResponse.json({
      error: 'Failed to create color trend',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
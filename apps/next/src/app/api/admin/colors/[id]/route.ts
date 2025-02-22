import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const colorTrend = await prisma.colorTrend.findUnique({
      where: { id },
    });

    if (!colorTrend) {
      return NextResponse.json({ error: 'Color trend not found' }, { status: 404 });
    }

    // Delete related analytics records
    await prisma.analytics.deleteMany({
      where: { trendId: id },
    });

    await prisma.colorTrend.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete color trend:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.hex || !data.imageUrl || typeof data.popularity !== 'number') {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Name, hex color, image URL, and popularity are required'
      }, { status: 400 });
    }

    // Validate hex color format for main color and palette colors
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(data.hex)) {
      return NextResponse.json({
        error: 'Invalid hex color',
        message: 'Hex color must be in format #RRGGBB or #RGB'
      }, { status: 400 });
    }

    // Validate palette colors if provided
    const paletteColors = ['palette1', 'palette2', 'palette3', 'palette4', 'palette5'];
    for (const key of paletteColors) {
      if (data[key] && !hexColorRegex.test(data[key])) {
        return NextResponse.json({
          error: 'Invalid palette color',
          message: `Palette color ${key} must be in format #RRGGBB or #RGB`
        }, { status: 400 });
      }
    }

    // Validate popularity range
    if (data.popularity < 0 || data.popularity > 100) {
      return NextResponse.json({
        error: 'Invalid popularity value',
        message: 'Popularity must be between 0 and 100'
      }, { status: 400 });
    }

    // Generate sample analytics data for the past 12 months if not provided
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

    // Update the color trend and its analytics
    const colorTrend = await prisma.colorTrend.update({
      where: { id },
      data: {
        name: data.name,
        hex: data.hex,
        imageUrl: data.imageUrl,
        popularity: data.popularity,
        palette1: data.palette1 || null,
        palette2: data.palette2 || null,
        palette3: data.palette3 || null,
        palette4: data.palette4 || null,
        palette5: data.palette5 || null,
        analytics: {
          upsert: {
            create: {
              dates,
              values,
            },
            update: {
              dates,
              values,
            },
          },
        },
      },
      include: {
        analytics: true,
      },
    });

    return NextResponse.json(colorTrend);
  } catch (error) {
    console.error('Failed to update color trend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
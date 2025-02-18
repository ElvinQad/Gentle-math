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

    const colorTrend = await prisma.colorTrend.update({
      where: { id },
      data: {
        name: data.name,
        hex: data.hex,
        imageUrl: data.imageUrl,
        popularity: data.popularity,
      },
    });

    return NextResponse.json(colorTrend);
  } catch (error) {
    console.error('Failed to update color trend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
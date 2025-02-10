import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { getSheetData, convertSheetDataToTrendData } from '@/lib/sheets';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { spreadsheetUrl } = await req.json();

    // Fetch and process spreadsheet data
    const sheetData = await getSheetData(spreadsheetUrl);
    const trendData = convertSheetDataToTrendData(sheetData);

    // Get the trend ID
    const { id } = await params;

    // Get the trend with analytics
    const trend = await prisma.trend.findUnique({
      where: { id },
      include: { analytics: true },
    });

    // Create or update analytics
    await prisma.analytics.upsert({
      where: {
        id: trend?.analytics[0]?.id ?? 'new',
      },
      create: {
        trendId: id,
        dates: trendData.dates,
        values: trendData.values,
      },
      update: {
        dates: trendData.dates,
        values: trendData.values,
      },
    });

    // Get updated trend with analytics
    const updatedTrend = await prisma.trend.findUnique({
      where: { id },
      include: { analytics: true },
    });

    return NextResponse.json(updatedTrend);
  } catch (error) {
    console.error('Failed to process spreadsheet:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

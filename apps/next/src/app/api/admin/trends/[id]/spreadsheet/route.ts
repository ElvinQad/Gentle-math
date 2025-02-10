import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { getSheetData, convertSheetDataToTrendData } from '@/lib/sheets';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized - Admin access required' }),
        { status: 401 }
      );
    }

    const { spreadsheetUrl } = await req.json();
    
    if (!spreadsheetUrl || !spreadsheetUrl.trim()) {
      return new NextResponse(
        JSON.stringify({ message: 'Spreadsheet URL is required' }),
        { status: 400 }
      );
    }

    // Get the trend ID
    const { id } = await params;

    // Verify trend exists
    const existingTrend = await prisma.trend.findUnique({
      where: { id },
    });

    if (!existingTrend) {
      return new NextResponse(
        JSON.stringify({ message: 'Trend not found' }),
        { status: 404 }
      );
    }

    try {
      // Fetch and process spreadsheet data
      const sheetData = await getSheetData(spreadsheetUrl);
      const trendData = convertSheetDataToTrendData(sheetData);

      // Create or update analytics
      await prisma.analytics.upsert({
        where: {
          trendId: id,
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
      console.error('Spreadsheet processing error:', error);
      return new NextResponse(
        JSON.stringify({ 
          message: error instanceof Error ? error.message : 'Failed to process spreadsheet data'
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to process spreadsheet:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error while processing spreadsheet'
      }),
      { status: 500 }
    );
  }
}

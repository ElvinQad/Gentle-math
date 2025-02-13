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
    console.log('Processing spreadsheet:', { spreadsheetUrl });
    
    if (!spreadsheetUrl || !spreadsheetUrl.trim()) {
      return new NextResponse(
        JSON.stringify({ message: 'Spreadsheet URL is required' }),
        { status: 400 }
      );
    }

    // Get the trend ID
    const { id } = await params;
    console.log('Trend ID:', id);

    // Verify trend exists
    const existingTrend = await prisma.trend.findUnique({
      where: { id },
      include: { analytics: true }
    });

    if (!existingTrend) {
      return new NextResponse(
        JSON.stringify({ message: 'Trend not found' }),
        { status: 404 }
      );
    }

    console.log('Existing trend:', existingTrend);

    try {
      // Fetch and process spreadsheet data
      const sheetData = await getSheetData(spreadsheetUrl);
      console.log('Sheet data fetched:', sheetData);
      
      const trendData = convertSheetDataToTrendData(sheetData);
      console.log('Trend data converted:', trendData);

      // Create or update analytics
      const analytics = await prisma.analytics.upsert({
        where: {
          trendId: id,
        },
        create: {
          trendId: id,
          dates: trendData.dates.map(d => d.toISOString()),
          values: trendData.values,
        },
        update: {
          dates: trendData.dates.map(d => d.toISOString()),
          values: trendData.values,
        },
      });

      console.log('Analytics updated:', analytics);

      // Get updated trend with analytics
      const updatedTrend = await prisma.trend.findUnique({
        where: { id },
        include: { analytics: true },
      });

      console.log('Updated trend:', updatedTrend);

      return NextResponse.json(updatedTrend);
    } catch (error) {
      console.error('Spreadsheet processing error:', error);
      return new NextResponse(
        JSON.stringify({ 
          message: error instanceof Error ? error.message : 'Failed to process spreadsheet data',
          error: error instanceof Error ? error.stack : undefined
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to process spreadsheet:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error while processing spreadsheet',
        error: error instanceof Error ? error.stack : undefined
      }),
      { status: 500 }
    );
  }
}

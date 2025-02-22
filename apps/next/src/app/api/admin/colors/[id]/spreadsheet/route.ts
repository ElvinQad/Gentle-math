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

    // Get the color ID
    const { id } = await params;
    console.log('Color ID:', id);

    // Verify color exists
    const existingColor = await prisma.colorTrend.findUnique({
      where: { id },
      include: { analytics: true }
    });

    if (!existingColor) {
      return new NextResponse(
        JSON.stringify({ message: 'Color not found' }),
        { status: 404 }
      );
    }

    console.log('Existing color:', existingColor);

    try {
      // Fetch and process spreadsheet data
      const sheetData = await getSheetData(spreadsheetUrl);
      console.log('Raw sheet data fetched:', sheetData);
      
      const trendData = convertSheetDataToTrendData(sheetData);
      console.log('Processed trend data:', {
        dates: trendData.dates.map(d => d.toISOString()),
        values: trendData.values,
        ageSegments: trendData.ageSegments
      });

      // Delete existing analytics if any
      if (existingColor.analytics) {
        await prisma.analytics.delete({
          where: { id: existingColor.analytics.id }
        });
      }

      // Create new analytics
      const analytics = await prisma.analytics.create({
        data: {
          dates: trendData.dates,
          values: trendData.values,
          ageSegments: trendData.ageSegments || [],
          colorId: id
        }
      });

      console.log('Analytics created:', analytics);

      // Get the updated color with analytics
      const updatedColor = await prisma.colorTrend.findUnique({
        where: { id },
        include: { analytics: true }
      });

      console.log('Updated color:', updatedColor);

      return NextResponse.json(updatedColor);
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
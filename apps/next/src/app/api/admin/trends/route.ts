import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { getSheetData, convertSheetDataToTrendData } from '@/lib/sheets';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const trends = await prisma.trend.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        analytics: true,
      },
    });

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    // Verify all images are accessible before creating the trend
    const imageVerificationPromises = data.imageUrls.map(async (url: string) => {
      const maxRetries = 10;
      const retryDelay = 1000;
      let lastError = null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`Verifying image (attempt ${i + 1}/${maxRetries}): ${url}`);
          const response = await fetch(url, { 
            method: 'HEAD',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            console.log(`Image verified accessible: ${url}`);
            return { success: true, url };
          }
          
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        } catch (error) {
          console.log(`Attempt ${i + 1}: Image not yet accessible: ${url}`);
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      console.warn(`Image not accessible after ${maxRetries} attempts:`, {
        url,
        lastError
      });
      return { success: false, url, error: lastError };
    });

    const verificationResults = await Promise.all(imageVerificationPromises);
    const failedImages = verificationResults.filter(result => !result.success);
    
    if (failedImages.length > 0) {
      console.error('Some images are not accessible:', failedImages);
      // Instead of just warning, we'll return an error response
      return NextResponse.json({
        error: 'Some images are not accessible',
        details: failedImages
      }, { status: 400 });
    }

    // Create the trend with analytics
    const trend = await prisma.trend.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        imageUrls: data.imageUrls,
        mainImageIndex: data.mainImageIndex,
        analytics: {
          create: {
            dates: [],
            values: [],
          },
        },
      },
      include: {
        analytics: true,
      },
    });

    // Only process spreadsheet if URL is provided and not empty
    if (data.spreadsheetUrl && data.spreadsheetUrl.trim()) {
      try {
        const sheetData = await getSheetData(data.spreadsheetUrl);
        const trendData = convertSheetDataToTrendData(sheetData);

        await prisma.analytics.update({
          where: { trendId: trend.id },
          data: {
            dates: trendData.dates,
            values: trendData.values,
          },
        });
      } catch (error) {
        console.error('Failed to process spreadsheet:', error);
      }
    }

    return NextResponse.json(trend);
  } catch (error) {
    console.error('Failed to create trend:', error);
    return NextResponse.json({
      error: 'Failed to create trend',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

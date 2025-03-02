import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { deleteFromS3 } from '@/lib/s3';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch trend with analytics data
    const trend = await prisma.trend.findUnique({
      where: { id },
      include: {
        analytics: true,
      },
    });

    if (!trend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 });
    }

    // Enhanced logging for debugging
    console.log(`Admin: Fetched trend ${id} with analytics:`, { 
      hasAnalytics: !!trend.analytics,
      analyticsType: typeof trend.analytics,
      analyticsIsArray: Array.isArray(trend.analytics?.values),
      dataPoints: Array.isArray(trend.analytics?.values) ? trend.analytics.values.length : 0,
      datePoints: Array.isArray(trend.analytics?.dates) ? trend.analytics.dates.length : 0,
      sampleDate: Array.isArray(trend.analytics?.dates) && trend.analytics.dates.length > 0 
        ? (trend.analytics.dates[0] instanceof Date 
            ? trend.analytics.dates[0].toISOString() 
            : trend.analytics.dates[0]) 
        : null,
      hasAgeSegments: Array.isArray(trend.analytics?.ageSegments) ? trend.analytics.ageSegments.length > 0 : false
    });
    
    // Ensure dates are properly serialized if they exist
    if (trend.analytics && Array.isArray(trend.analytics.dates) && trend.analytics.dates.length > 0) {
      // Create a copy with dates converted to ISO strings
      const datesCopy = [...trend.analytics.dates];
      const serializedDates = datesCopy.map(date => 
        date instanceof Date ? date.toISOString() : String(date)
      );
      
      // Update the analytics object with the serialized dates
      // Use unknown as an intermediate type to avoid type errors
      ((trend.analytics as unknown) as { dates: string[] }).dates = serializedDates;
    }

    return NextResponse.json(trend);
  } catch (error) {
    console.error('Failed to fetch trend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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

    const trend = await prisma.trend.findUnique({
      where: { id },
    });

    if (!trend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 });
    }

    // Delete related analytics records
    await prisma.analytics.deleteMany({
      where: { trendId: id },
    });

    // Delete images from S3
    for (const imageUrl of trend.imageUrls) {
      try {
        // Only attempt deletion for images in our S3 bucket
        const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (imageUrl.startsWith(bucketUrl)) {
          const key = imageUrl.replace(bucketUrl, '');
          await deleteFromS3(key);
          console.log('Successfully deleted S3 image:', key);
        } else {
          console.log('Skipping non-S3 image:', imageUrl);
        }
      } catch (error) {
        console.error('Failed to delete image:', {
          imageUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await prisma.trend.delete({ where: { id } });

    console.log('Session data at deletion:', {
      session: await getServerSession(authConfig),
      params: await params,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trend:', {
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
    
    // Log detailed information about the category assignment
    console.log(`Updating trend ID ${id} with category:`, { 
      providedCategoryId: data.categoryId,
      finalCategoryId: data.categoryId || null
    });

    const trend = await prisma.trend.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        imageUrls: data.imageUrls,
        mainImageIndex: data.mainImageIndex,
        categoryId: data.categoryId || null,
      },
    });

    console.log(`Trend updated successfully. Category ID set to: ${trend.categoryId || 'null'}`);

    return NextResponse.json(trend);
  } catch (error) {
    console.error('Failed to update trend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import { deleteFromS3 } from '@/lib/s3'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    )
  }

  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trend = await prisma.trend.findUnique({
      where: { id }
    })

    if (!trend) {
      return NextResponse.json(
        { error: 'Trend not found' },
        { status: 404 }
      )
    }

    // Delete related analytics records
    await prisma.analytics.deleteMany({
      where: { trendId: id }
    })

    // Delete images from S3
    for (const imageUrl of trend.imageUrls) {
      try {
        // Only attempt deletion for images in our S3 bucket
        const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
        if (imageUrl.startsWith(bucketUrl)) {
          const key = imageUrl.replace(bucketUrl, '')
          await deleteFromS3(key)
          console.log('Successfully deleted S3 image:', key)
        } else {
          console.log('Skipping non-S3 image:', imageUrl)
        }
      } catch (error) {
        console.error('Failed to delete image:', {
          imageUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    await prisma.trend.delete({ where: { id } })

    console.log('Session data at deletion:', {
      session: await getServerSession(authConfig),
      params: await params
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete trend:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available'
    })
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    )
  }

  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const trend = await prisma.trend.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        imageUrls: data.imageUrls,
        mainImageIndex: data.mainImageIndex,
      }
    })

    return NextResponse.json(trend)
  } catch (error) {
    console.error('Failed to update trend:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 
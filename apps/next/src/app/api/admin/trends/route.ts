import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import { getSheetData, convertSheetDataToTrendData } from '@/lib/sheets'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const trends = await prisma.trend.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        analytics: true
      }
    })

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Failed to fetch trends:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    
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
            values: []
          }
        }
      },
      include: {
        analytics: true
      }
    })

    // If spreadsheet URL is provided, process it
    if (data.spreadsheetUrl) {
      const sheetData = await getSheetData(data.spreadsheetUrl)
      const trendData = convertSheetDataToTrendData(sheetData)
      
      // Update analytics with processed data
      await prisma.analytics.update({
        where: { trendId: trend.id },
        data: {
          dates: trendData.dates,
          values: trendData.values
        }
      })
    }

    return NextResponse.json(trend)
  } catch (error) {
    console.error('Failed to create trend:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
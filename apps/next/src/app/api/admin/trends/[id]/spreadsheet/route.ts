import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import { getSheetData, convertSheetDataToTrendData } from '@/lib/sheets'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { spreadsheetUrl } = await req.json()

    // Fetch and process spreadsheet data
    const sheetData = await getSheetData(spreadsheetUrl)
    const trendData = convertSheetDataToTrendData(sheetData)

    // Update the trend with new data
    const { id } = await params;
    const trend = await prisma.trend.update({
      where: { id },
      data: { data: trendData }
    })

    return NextResponse.json(trend)
  } catch (error) {
    console.error('Failed to process spreadsheet:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import type { JsonValue } from '@prisma/client/runtime/library'

interface Activity {
  id: string
  userId: string
  type: string
  timestamp: Date
  metadata: JsonValue
}

interface ActivityMetadata {
  path?: string
  userAgent?: string
}

async function isAdminUser(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true }
  })
  
  return user?.isAdmin === true
}

// Helper function to group activities by date
function groupActivitiesByDate(activities: Activity[]) {
  const grouped = new Map<string, Activity[]>()
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp).toLocaleDateString()
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)?.push(activity)
  })
  
  return Object.fromEntries(grouped)
}

// Helper function to calculate activity statistics
function calculateActivityStats(activities: Activity[]) {
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    last24Hours: activities.filter(a => new Date(a.timestamp) > last24Hours).length,
    lastWeek: activities.filter(a => new Date(a.timestamp) > lastWeek).length,
    lastMonth: activities.filter(a => new Date(a.timestamp) > lastMonth).length,
    total: activities.length,
    mostVisitedPaths: Object.entries(
      activities.reduce((acc: Record<string, number>, activity) => {
        const metadata = activity.metadata as ActivityMetadata
        const path = metadata?.path || 'unknown'
        acc[path] = (acc[path] || 0) + 1
        return acc
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    browsers: Object.entries(
      activities.reduce((acc: Record<string, number>, activity) => {
        const metadata = activity.metadata as ActivityMetadata
        const browser = metadata?.userAgent || 'unknown'
        acc[browser] = (acc[browser] || 0) + 1
        return acc
      }, {})
    ),
    activityByHour: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: activities.filter(a => new Date(a.timestamp).getHours() === hour).length
    }))
  }
}

// Calculate user status
function calculateUserStatus(activities: Activity[], now: Date) {
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  if (activities.some(a => new Date(a.timestamp) > fifteenMinutesAgo)) {
    return 'online'
  } else if (activities.some(a => new Date(a.timestamp) > oneDayAgo)) {
    return 'away'
  } else if (activities.some(a => new Date(a.timestamp) > oneWeekAgo)) {
    return 'inactive'
  } else {
    return 'offline'
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await context.params
    const { userId } = params
    
    const session = await getServerSession(authConfig)
    
    // Check authentication
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt to admin API')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify admin status
    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      console.log('Non-admin user attempted to fetch user sessions:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1000 // Get last 1000 activities
        },
      }
    })

    if (!userDetails) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Calculate active status based on recent activity
    const now = new Date()
    const status = calculateUserStatus(userDetails.activities, now)
    
    // Format and analyze the data
    const formattedData = {
      user: {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        createdAt: userDetails.createdAt,
        lastActive: userDetails.activities[0]?.timestamp || null,
        isActive: status === 'online',
        status: status
      },
      activities: {
        recent: userDetails.activities.slice(0, 10).map((activity: Activity) => ({
          id: activity.id,
          type: activity.type,
          timestamp: activity.timestamp,
          metadata: activity.metadata,
        })),
        byDate: groupActivitiesByDate(userDetails.activities),
        stats: calculateActivityStats(userDetails.activities)
      },
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('User activity fetch error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
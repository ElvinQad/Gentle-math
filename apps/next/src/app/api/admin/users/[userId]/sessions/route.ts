import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import { Prisma, UserActivity, Account } from '@prisma/client'

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    activities: true
    accounts: true
  }
}>

async function isAdminUser(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true }
  })
  
  return user?.isAdmin === true
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
          take: 50
        },
        accounts: true
      }
    }) as Prisma.UserGetPayload<{
      include: {
        activities: true,
        accounts: true
      }
    }>

    if (!userDetails) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Calculate active status based on recent activity
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
    
    // Format the data
    const formattedData = {
      activities: userDetails.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        timestamp: activity.timestamp,
        metadata: activity.metadata,
      })),
      accounts: userDetails.accounts.map(account => ({
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
      })),
      stats: {
        totalActivities: userDetails.activities.length,
        recentActivities: userDetails.activities.filter(a => a.timestamp > fifteenMinutesAgo).length,
        connectedProviders: new Set(userDetails.accounts.map(a => a.provider)).size,
      }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('User activity fetch error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
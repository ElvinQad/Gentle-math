import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'

async function isAdminUser(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true }
  })
  
  return user?.isAdmin === true
}

// Add months to a date properly
function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  const currentMonth = newDate.getMonth()
  const currentDate = newDate.getDate()
  
  // Set the new month
  newDate.setMonth(currentMonth + months)
  
  // If the new date is less than the original date,
  // it means we've rolled over (e.g., Jan 31 + 1 month = Mar 3)
  // so we need to set to the last day of the previous month
  if (newDate.getDate() !== currentDate) {
    newDate.setDate(0)
  }
  
  return newDate
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    
    // Check authentication
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt to admin API')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify admin status
    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      console.log('Non-admin user attempted to modify subscription:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { months } = await req.json()
    
    // Validate months
    if (!months || typeof months !== 'number' || months < 1) {
      return new NextResponse('Invalid subscription duration', { status: 400 })
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: params.userId }
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Calculate new subscription end date
    const now = new Date()
    const newEndDate = currentUser.subscribedUntil && currentUser.subscribedUntil > now
      ? addMonths(currentUser.subscribedUntil, months)
      : addMonths(now, months)

    // Update user subscription
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { subscribedUntil: newEndDate }
    })

    // Filter sensitive data
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      subscribedUntil: user.subscribedUntil,
    }

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    console.error('Subscription update error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    
    // Check authentication
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt to admin API')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify admin status
    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      console.log('Non-admin user attempted to remove subscription:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Update user subscription
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { subscribedUntil: null }
    })

    // Filter sensitive data
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      subscribedUntil: user.subscribedUntil,
    }

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    console.error('Subscription removal error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
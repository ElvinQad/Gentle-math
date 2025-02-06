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
      console.log('Non-admin user attempted to clear activities:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Delete all activities for the user
    await prisma.userActivity.deleteMany({
      where: { userId: params.userId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Activity clear error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
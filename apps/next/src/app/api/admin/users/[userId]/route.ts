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
      console.log('Non-admin user attempted to modify user:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { isAdmin: setAdminStatus } = await req.json()

    // Prevent removing own admin status
    if (params.userId === session.user.id && !setAdminStatus) {
      console.log('Admin attempted to remove their own admin status:', session.user.email)
      return new NextResponse('Cannot remove your own admin status', { status: 400 })
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { isAdmin: setAdminStatus }
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
    console.error('Admin user update error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: { userId: string } }
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
      console.log('Non-admin user attempted to delete user:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Prevent self-deletion
    if (context.params.userId === session.user.id) {
      console.log('Admin attempted to delete their own account:', session.user.email)
      return new NextResponse('Cannot delete your own account', { status: 400 })
    }

    // Check if target user is also an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: context.params.userId },
      select: { isAdmin: true, email: true }
    })

    if (targetUser?.isAdmin) {
      console.log('Attempted to delete admin user:', targetUser.email)
      return new NextResponse('Cannot delete admin users', { status: 400 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: context.params.userId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
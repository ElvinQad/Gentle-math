import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'
import type { User } from '@prisma/client'

async function isAdminUser(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true }
  })
  
  return user?.isAdmin === true
}

export async function GET() {
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
      console.log('Non-admin user attempted to access admin API:', session.user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter sensitive data before sending response
    const sanitizedUsers = users.map((user: User) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      subscribedUntil: user.subscribedUntil,
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
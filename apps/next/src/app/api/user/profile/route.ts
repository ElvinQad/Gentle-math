import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authConfig } from '@/lib/auth'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await req.json()
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
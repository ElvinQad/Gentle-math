import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    await prisma.userActivity.create({ data })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track user activity:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 
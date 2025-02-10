import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { getPresignedUrl } from '@/lib/s3'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { filename, contentType } = await req.json()

    // Generate a unique key for the file
    const key = `trends/${crypto.randomUUID()}-${filename}`

    // Get a presigned URL for direct upload
    const presignedUrl = await getPresignedUrl(key, contentType)
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return NextResponse.json({ 
      presignedUrl,
      publicUrl,
      key
    })
  } catch (error) {
    console.error('Upload error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
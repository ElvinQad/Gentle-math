import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Define the activity schema
const activitySchema = z.object({
  type: z.string(),
  metadata: z.record(z.any()).optional().default({}),
})

// Batch processing setup
const BATCH_SIZE = 10
const BATCH_INTERVAL = 5000 // 5 seconds
let activityQueue: Array<{
  userId: string
  type: string
  metadata: Prisma.InputJsonValue
  timestamp: Date
}> = []
let batchTimeout: NodeJS.Timeout | null = null

// Function to process the batch
async function processBatch() {
  if (activityQueue.length === 0) return

  const activities = [...activityQueue]
  activityQueue = [] // Clear the queue

  try {
    // Use transaction and createMany for better performance
    await prisma.$transaction(async (tx) => {
      await tx.userActivity.createMany({
        data: activities,
        skipDuplicates: true, // Skip if exact duplicate exists
      })
    })
  } catch (error) {
    console.error('Failed to process activity batch:', error)
    // In case of error, add activities back to queue
    activityQueue = [...activities, ...activityQueue]
  }
}

// Schedule batch processing
function scheduleBatchProcessing() {
  if (batchTimeout) return

  batchTimeout = setTimeout(() => {
    batchTimeout = null
    processBatch()
  }, BATCH_INTERVAL)
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = activitySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: validationResult.error.issues 
      }, { status: 400 })
    }

    const { type, metadata } = validationResult.data
    const timestamp = new Date()

    // Add to queue instead of immediate database write
    activityQueue.push({
      userId: session.user.id,
      type,
      metadata,
      timestamp,
    })

    // Process immediately if batch size reached
    if (activityQueue.length >= BATCH_SIZE) {
      processBatch()
    } else {
      scheduleBatchProcessing()
    }

    return NextResponse.json({ 
      success: true,
      queued: true,
      activity: {
        type,
        timestamp,
        metadata
      }
    })
  } catch (error) {
    console.error('Failed to queue user activity:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 
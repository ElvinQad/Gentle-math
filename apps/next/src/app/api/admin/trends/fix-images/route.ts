import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import { S3Client, PutObjectAclCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export async function POST() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all trends
    const trends = await prisma.trend.findMany();
    const results = [];

    // Fix permissions for each image
    for (const trend of trends) {
      for (const imageUrl of trend.imageUrls) {
        try {
          // Extract key from URL
          const key = imageUrl.replace(`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`, '');
          
          // Update ACL to public-read
          const command = new PutObjectAclCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ACL: 'public-read'
          });

          await s3Client.send(command);
          console.log('Fixed permissions for:', key);
          
          results.push({
            success: true,
            key,
            url: imageUrl
          });
        } catch (error) {
          console.error('Failed to fix permissions for image:', {
            url: imageUrl,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          results.push({
            success: false,
            url: imageUrl,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Completed fixing image permissions',
      results
    });
  } catch (error) {
    console.error('Failed to fix image permissions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix image permissions'
    }, { status: 500 });
  }
} 
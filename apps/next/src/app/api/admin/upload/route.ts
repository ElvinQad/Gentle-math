import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to sanitize filenames
function sanitizeFilename(filename: string): string {
  // Remove special characters and spaces, keep extension
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const base = filename.split('.').slice(0, -1).join('.');
  const sanitized = base
    .replace(/[^a-zA-Z0-9-]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .toLowerCase();
  return `${sanitized}.${ext}`;
}

// Function to check if file exists in S3
async function checkFileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    return false;
  }
}

// Function to list objects with a prefix
async function listObjectsWithPrefix(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: prefix
  });
  
  return await s3Client.send(command);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    const { filename, contentType, contentHash } = data;

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize the filename
    const sanitizedFilename = sanitizeFilename(filename);

    // If content hash is provided, check for duplicates
    if (contentHash) {
      const objects = await listObjectsWithPrefix('trends/');
      
      for (const obj of objects.Contents || []) {
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: obj.Key
          });
          const headResponse = await s3Client.send(headCommand);
          
          if (headResponse.Metadata?.['content-hash'] === contentHash) {
            return NextResponse.json({
              isDuplicate: true,
              publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
            });
          }
        } catch (error) {
          console.warn('Error checking file metadata:', error);
        }
      }
    }

    // Generate a unique key for the new file
    const uniqueId = crypto.randomUUID();
    const key = `trends/${uniqueId}-${sanitizedFilename}`;

    // Create the command for generating presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000',
      Metadata: {
        'content-hash': contentHash || '',
        'original-name': filename
      }
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

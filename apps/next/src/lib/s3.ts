import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Check for server-side environment variables first, then fall back to public ones
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

// Only throw error on server side if credentials are missing
if (typeof window === 'undefined' && (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY)) {
  throw new Error('Missing required AWS credentials in server environment');
}

// Initialize S3 client only on server side
const s3Client = typeof window === 'undefined' ? new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = AWS_BUCKET_NAME;
const REGION = AWS_REGION;

// Function to generate content hash
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

// Function to check if file exists
async function checkFileExists(key: string): Promise<boolean> {
  if (!s3Client) return false;
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

// Function to get public URL
function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

export async function uploadToS3(file: File, baseKey: string) {
  if (!s3Client) {
    throw new Error('S3 client is not available on the client side. Use the upload API endpoint instead.');
  }

  try {
    // Generate hash from file content
    const contentHash = await generateFileHash(file);
    
    // Extract file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Create new key with content hash
    const key = `${baseKey}/${contentHash}.${extension}`;
    
    // Check if file with this hash already exists
    const exists = await checkFileExists(key);
    if (exists) {
      console.log('File with identical content already exists:', key);
      return getPublicUrl(key);
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000',
      Metadata: {
        'content-hash': contentHash,
        'original-name': file.name
      }
    });

    await s3Client.send(command);
    const publicUrl = getPublicUrl(key);
    
    // Wait for the file to be accessible (retry a few times)
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('Successfully uploaded and verified file:', {
            key,
            contentType: file.type,
            publicUrl,
            contentHash,
            attempt: i + 1
          });
          return publicUrl;
        }
      } catch {
        console.log(`Attempt ${i + 1}: File not yet accessible, retrying...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    console.warn('File uploaded but not immediately accessible:', {
      key,
      contentType: file.type,
      publicUrl,
      contentHash
    });
    
    return publicUrl;
  } catch (error) {
    console.error('Failed to upload file:', {
      fileName: file.name,
      contentType: file.type,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function deleteFromS3(key: string) {
  if (!s3Client) {
    throw new Error('S3 client is not available on the client side. Use the delete API endpoint instead.');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    console.log('Successfully deleted S3 object:', key);
    return response;
  } catch (error) {
    console.error('S3 deletion error:', {
      key,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to delete file from storage');
  }
}

export async function getPresignedUrl(key: string, contentType: string) {
  if (!s3Client) {
    throw new Error('S3 client is not available on the client side. Use the upload API endpoint instead.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: 'max-age=31536000',
    Metadata: {
      'uploaded-by': 'debug-tool'
    }
  });

  try {
    console.log('Generating presigned URL for:', {
      bucket: BUCKET_NAME,
      key,
      contentType,
      region: REGION,
      acl: 'public-read'
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Return both the upload URL and the final public URL
    const publicUrl = getPublicUrl(key);
    console.log('Generated presigned URL:', url);
    console.log('Public URL will be:', publicUrl);
    
    return url;
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    throw error;
  }
}

export async function testS3Connection() {
  if (!s3Client) {
    throw new Error('S3 client is not available on the client side. Use the API endpoint instead.');
  }

  try {
    // Test uploading a small text file
    const testKey = `test-${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: 'Test file for S3 connection',
      ContentType: 'text/plain',
    });

    // Get a pre-signed URL for uploading
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });

    // Test the upload using fetch with CORS headers
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: 'Test file for S3 connection',
      headers: {
        'Content-Type': 'text/plain',
        'Origin': process.env.NEXTAUTH_URL || 'http://localhost:3000'
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Clean up the test file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
    });
    await s3Client.send(deleteCommand);

    return {
      success: true,
      message: 'S3 connection test successful',
    };
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

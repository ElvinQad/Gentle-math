import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface FileUploadOptions {
  onSuccess?: (urls: string[]) => void;
  onError?: (error: Error) => void;
}

export async function calculateContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const uniqueFiles = new Map<string, File>();

    try {
      // Filter out duplicate files
      for (const file of files) {
        const key = `${file.size}-${file.name}`;
        if (!uniqueFiles.has(key)) {
          uniqueFiles.set(key, file);
        } else {
          console.log('Skipping potential duplicate file:', file.name);
        }
      }

      for (const file of Array.from(uniqueFiles.values())) {
        const contentHash = await calculateContentHash(file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            contentHash
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to get upload URL:', errorText);
          throw new Error('Failed to get upload URL');
        }

        const data = await response.json();
        
        // If duplicate was found, use the existing URL
        if (data.isDuplicate) {
          console.log('Using existing file:', data.publicUrl);
          toast.info(`File "${file.name}" already exists, using existing file`);
          uploadedUrls.push(data.publicUrl);
          continue;
        }

        // Upload the file
        const uploadResponse = await fetch(data.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        uploadedUrls.push(data.publicUrl);
      }

      options.onSuccess?.(uploadedUrls);
      toast.success('Files uploaded successfully');
      return uploadedUrls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      console.error('Upload error:', error);
      toast.error(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  return {
    uploadFiles,
    isUploading
  };
} 
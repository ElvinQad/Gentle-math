'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

export function AppearanceTab() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState<string>('/bg.avif');

  useEffect(() => {
    const fetchCurrentBgImage = async () => {
      try {
        const response = await fetch('/api/admin/settings/background');
        if (response.ok) {
          const data = await response.json();
          setCurrentBgImage(data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch background image:', error);
      }
    };

    fetchCurrentBgImage();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Get presigned URL
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');
      const { presignedUrl, publicUrl, key } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload file');
      console.log('File uploaded successfully with key:', key);

      // Update background image setting
      const updateResponse = await fetch('/api/admin/settings/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      if (!updateResponse.ok) throw new Error('Failed to update background image');

      setCurrentBgImage(publicUrl);
      toast.success('Background image updated successfully');
    } catch (error) {
      toast.error('Failed to update background image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
        <CardHeader>
          <CardTitle className="text-[color:var(--card-foreground)]">Background Image</CardTitle>
          <CardDescription className="text-[color:var(--muted-foreground)]">
            Manage the background image shown on the landing page. Recommended size: 1920x1080px.
            Maximum file size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[color:var(--border)]">
              <Image
                src={currentBgImage}
                alt="Current background"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button
                disabled={isUploading}
                onClick={() => document.getElementById('bgImageInput')?.click()}
                className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
              >
                {isUploading ? 'Uploading...' : 'Change Background'}
              </Button>
              <input
                type="file"
                id="bgImageInput"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import { useFileUpload } from '@/hooks/useFileUpload';

export interface ImagePreview {
  url: string;
  isMain: boolean;
}

interface ImageManagerProps {
  images: ImagePreview[];
  onChange: (images: ImagePreview[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageManager({ images, onChange, maxImages = Infinity, className = '' }: ImageManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { uploadFiles, isUploading } = useFileUpload({
    onSuccess: (urls) => {
      const newImages = [
        ...images,
        ...urls.map((url) => ({ url, isMain: images.length === 0 }))
      ].filter((img) => isValidUrl(img.url));
      onChange(newImages);
    }
  });

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    onChange(newImages);
  }, [images, onChange]);

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onChange(newImages);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (images.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/'),
      );
      if (files.length === 0) {
        toast.error('Please drop only image files');
        return;
      }

      uploadFiles(files);
    },
    [uploadFiles, images.length, maxImages],
  );

  const handleImageError = useCallback((url: string, index: number) => {
    if (failedImages.has(url)) return;
    
    setFailedImages(prev => new Set(Array.from(prev).concat([url])));
    toast.error(
      `Failed to load image: ${url}`,
      {
        description: 'The image might be private or inaccessible.',
        action: {
          label: 'Remove',
          onClick: () => removeImage(index),
        },
        duration: 5000,
      }
    );
  }, [failedImages, removeImage]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging ? 'border-[color:var(--primary)] bg-[color:var(--primary)]/5' : 'border-[color:var(--border)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (images.length >= maxImages) {
              toast.error(`Maximum ${maxImages} images allowed`);
              return;
            }
            uploadFiles(Array.from(e.target.files || []));
          }}
          disabled={isUploading}
        />
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[color:var(--primary)]/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[color:var(--primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-[color:var(--foreground)]">
              {isUploading ? 'Uploading...' : 'Drop images here or click to upload'}
            </p>
            <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
              Support for PNG, JPG, JPEG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="group relative aspect-video">
              <div className="absolute inset-0 bg-[color:var(--muted)] rounded-lg">
                <Image
                  src={img.url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg transition-transform duration-300 ease-out-expo group-hover:scale-105"
                  onError={() => handleImageError(img.url, index)}
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-[color:var(--background)]/50 backdrop-blur-sm opacity-0 
                group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant={img.isMain ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setMainImage(index)}
                  className={img.isMain 
                    ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]' 
                    : 'bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]'
                  }
                >
                  {img.isMain ? 'Main' : 'Set Main'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(index)}
                  className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
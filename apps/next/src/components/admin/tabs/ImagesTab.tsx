import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImagePreview {
  url: string;
  isMain: boolean;
}

interface ImagesTabProps {
  imageUrls: ImagePreview[];
  setImageUrls: (urls: ImagePreview[]) => void;
  onFileUpload: (files: File[]) => Promise<void>;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function ImagesTab({ imageUrls, setImageUrls, onFileUpload }: ImagesTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUrlChange = (index: number, value: string) => {
    try {
      new URL(value);
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = { ...newImageUrls[index], url: value };
      setImageUrls(newImageUrls);
    } catch {
      if (value) {
        toast.error('Please enter a valid URL');
      }
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, { url: '', isMain: false }]);
  };

  const removeImageUrl = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    if (imageUrls[index].isMain && newImageUrls.length > 0) {
      newImageUrls[0].isMain = true;
    }
    setImageUrls(newImageUrls);
  };

  const setMainImage = (index: number) => {
    const newImageUrls = imageUrls.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImageUrls(newImageUrls);
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

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/'),
      );
      if (files.length === 0) {
        toast.error('Please drop only image files');
        return;
      }

      onFileUpload(files);
    },
    [onFileUpload],
  );

  return (
    <div className="space-y-8">
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
          onChange={(e) => onFileUpload(Array.from(e.target.files || []))}
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
              Drop images here or click to upload
            </p>
            <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
              Support for PNG, JPG, JPEG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Image URLs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">Image URLs</Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={addImageUrl}
            className="text-[color:var(--primary)] hover:text-[color:var(--primary)]/90"
          >
            Add URL
          </Button>
        </div>

        {imageUrls.map((img, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={img.url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder="Enter image URL"
              className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
                focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
            />
            <Button
              type="button"
              variant={img.isMain ? 'default' : 'outline'}
              size="icon"
              onClick={() => setMainImage(index)}
              className={`shrink-0 ${
                img.isMain 
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]' 
                  : 'border-[color:var(--border)] hover:bg-[color:var(--primary)]/10'
              }`}
            >
              {img.isMain ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeImageUrl(index)}
              className="shrink-0 bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)]
                hover:bg-[color:var(--destructive)]/90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        ))}
      </div>

      {/* Image Previews */}
      {imageUrls.some((img) => isValidUrl(img.url)) && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">Preview</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageUrls.map((img, index) => {
              if (!img.url || !isValidUrl(img.url)) return null;

              return (
                <div key={`url-${index}`} className="relative group aspect-video">
                  <Image
                    src={img.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg transition-transform duration-300 ease-out-expo group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                      toast.error(
                        `Failed to load image: ${img.url}`,
                        {
                          description: 'The image might be private or inaccessible.',
                          action: {
                            label: 'Remove',
                            onClick: () => removeImageUrl(index),
                          },
                          duration: 5000,
                        }
                      );
                    }}
                  />
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
                      onClick={() => removeImageUrl(index)}
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 
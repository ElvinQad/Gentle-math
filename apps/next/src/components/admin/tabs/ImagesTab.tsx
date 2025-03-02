import { ImageManager, type ImagePreview } from '@/components/ui/ImageManager';

interface ImagesTabProps {
  imageUrls: ImagePreview[];
  setImageUrls: (urls: ImagePreview[]) => void;
  onFileUpload: (files: File[]) => Promise<string[]>;
}

export function ImagesTab({ imageUrls, setImageUrls }: ImagesTabProps) {
  return (
    <ImageManager
      images={imageUrls}
      onChange={setImageUrls}
      maxImages={10}
    />
  );
} 
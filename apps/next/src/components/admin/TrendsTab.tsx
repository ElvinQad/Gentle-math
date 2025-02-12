import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Trend } from '@/types/admin';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { signOut } from 'next-auth/react';

interface ImagePreview {
  url: string;
  isMain: boolean;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Function to calculate content hash using Web Crypto API
async function calculateContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function TrendsTab() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    imageUrls: [''],
    mainImageIndex: 0,
    spreadsheetUrl: '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<'details' | 'images' | 'data'>('details');
  const [imageUrls, setImageUrls] = useState<ImagePreview[]>([{ url: '', isMain: true }]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessingSpreadsheet, setIsProcessingSpreadsheet] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/admin/trends');
        if (!response.ok) throw new Error('Failed to fetch trends');
        const data = await response.json();
        setTrends(data);
      } catch {
        toast.error('Failed to load trends');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []);
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

  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      const uploadedUrls: string[] = [];
      const uniqueFiles = new Map<string, File>();

      // First, filter out duplicate files by comparing their sizes and names
      for (const file of files) {
        const key = `${file.size}-${file.name}`;
        if (!uniqueFiles.has(key)) {
          uniqueFiles.set(key, file);
        } else {
          console.log('Skipping potential duplicate file:', file.name);
        }
      }

      for (const file of Array.from(uniqueFiles.values())) {
        // Calculate content hash
        const contentHash = await calculateContentHash(file);

        console.log('Uploading file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          contentHash
        });

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
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        if (!isValidUrl(data.publicUrl)) {
          throw new Error(`Invalid URL received from server: ${data.publicUrl}`);
        }

        uploadedUrls.push(data.publicUrl);
      }

      // Update imageUrls state with the new URLs
      setImageUrls((prev) =>
        [...prev, ...uploadedUrls.map((url) => ({ url, isMain: prev.length === 0 }))].filter(
          (img) => isValidUrl(img.url),
        ),
      );

      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    }
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

      handleFileUpload(files);
    },
    [handleFileUpload],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validImageUrls = imageUrls.filter((img) => isValidUrl(img.url)).map((img) => img.url);
      if (validImageUrls.length === 0) {
        throw new Error('At least one valid image URL is required');
      }

      const mainImageIndex = imageUrls.findIndex((img) => img.isMain);

      // Validate spreadsheet URL if provided
      if (formData.spreadsheetUrl && !formData.spreadsheetUrl.includes('docs.google.com/spreadsheets')) {
        throw new Error('Please provide a valid Google Spreadsheet URL');
      }

      const response = await fetch(
        `/api/admin/trends${isEditMode && selectedTrend ? `/${selectedTrend.id}` : ''}`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            imageUrls: validImageUrls,
            mainImageIndex: mainImageIndex >= 0 ? mainImageIndex : 0,
            spreadsheetUrl: formData.spreadsheetUrl.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to ${isEditMode ? 'update' : 'create'} trend`);
      }

      const newTrend = await response.json();

      if (isEditMode) {
        setTrends(trends.map((t) => (t.id === newTrend.id ? newTrend : t)));
      } else {
        setTrends([...trends, newTrend]);
      }

      setIsModalOpen(false);
      resetForm();
      toast.success(`Trend ${isEditMode ? 'updated' : 'created'} successfully`);

      // Show a warning if spreadsheet URL was provided but no data was processed
      if (formData.spreadsheetUrl && (!newTrend.analytics || newTrend.analytics.length === 0)) {
        toast.warning('Trend was created but spreadsheet data could not be processed. Please check the spreadsheet URL and permissions.');
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} trend`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      imageUrls: [''],
      mainImageIndex: 0,
      spreadsheetUrl: '',
    });
    setImageUrls([{ url: '', isMain: true }]);
    setIsEditMode(false);
    setSelectedTrend(null);
  };

  const handleEditClick = (trend: Trend) => {
    setSelectedTrend(trend);
    setIsEditMode(true);
    setFormData({
      title: trend.title,
      description: trend.description,
      type: trend.type,
      imageUrls: trend.imageUrls,
      mainImageIndex: trend.mainImageIndex,
      spreadsheetUrl: trend.spreadsheetUrl || '',
    });
    setImageUrls(
      trend.imageUrls.map((url, index) => ({
        url,
        isMain: index === trend.mainImageIndex,
      })),
    );
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleProcessSpreadsheet = async () => {
    if (!formData.spreadsheetUrl) {
      toast.error('No spreadsheet URL provided');
      return;
    }

    try {
      setIsProcessingSpreadsheet(true);
      const trendId = selectedTrend?.id;
      if (!trendId) {
        throw new Error('No trend selected');
      }
      const response = await fetch(`/api/admin/trends/${trendId}/spreadsheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetUrl: formData.spreadsheetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to process spreadsheet';
        
        if (errorMessage.includes('Google authentication required')) {
          toast.error(
            'Google Sign-in Required',
            {
              description: 'Please sign out and sign in with Google to access spreadsheet data.',
              action: {
                label: 'Sign Out',
                onClick: () => signOut({ callbackUrl: '/' })
              },
              duration: 10000
            }
          );
          return;
        }
        
        throw new Error(errorMessage);
      }

      const updatedTrend = await response.json();
      setTrends(trends.map((t) => (t.id === updatedTrend.id ? updatedTrend : t)));
      toast.success('Spreadsheet data processed successfully');
    } catch (error) {
      console.error('Failed to process spreadsheet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process spreadsheet data');
    } finally {
      setIsProcessingSpreadsheet(false);
    }
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter trend title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter trend description"
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          required
        >
          <option value="">Select type</option>
          <option value="Fashion">Fashion</option>
          <option value="Technology">Technology</option>
          <option value="Lifestyle">Lifestyle</option>
          <option value="Business">Business</option>
        </select>
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
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
          onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
        />
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
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
            <p className="text-lg font-medium">Drop images here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              Support for PNG, JPG, JPEG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Image URLs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Image URLs</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addImageUrl}>
            Add URL
          </Button>
        </div>

        {imageUrls.map((img, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={img.url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder="Enter image URL"
            />
            <Button
              type="button"
              variant={img.isMain ? 'default' : 'outline'}
              size="icon"
              onClick={() => setMainImage(index)}
              className="shrink-0"
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
              className="shrink-0"
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
          <Label>Preview</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageUrls.map((img, index) => {
              if (!img.url || !isValidUrl(img.url)) return null;

              return (
                <div key={`url-${index}`} className="relative group aspect-video">
                  <Image
                    src={img.url || '/placeholder-image.jpg'}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                      
                      // Show a more detailed error message with retry option
                      toast.error(
                        `Failed to load image: ${img.url}`,
                        {
                          description: 'The image might be private. Try signing in as admin and using the fix-images endpoint.',
                          action: {
                            label: 'Fix Permissions',
                            onClick: async () => {
                              try {
                                const response = await fetch('/api/admin/trends/fix-images', {
                                  method: 'POST',
                                });
                                
                                if (!response.ok) {
                                  if (response.status === 401) {
                                    toast.error('Please sign in as admin first');
                                    return;
                                  }
                                  throw new Error('Failed to fix image permissions');
                                }
                                
                                // Retry loading the image
                                target.src = img.url;
                                toast.success('Image permissions updated. Retrying...');
                              } catch (error) {
                                toast.error('Failed to fix image permissions. Please try again.');
                              }
                            }
                          },
                          duration: 10000
                        }
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant={img.isMain ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setMainImage(index)}
                    >
                      {img.isMain ? 'Main' : 'Set Main'}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImageUrl(index)}
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

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="spreadsheet">Google Spreadsheet URL</Label>
        <div className="flex gap-2">
          <Input
            id="spreadsheet"
            type="url"
            value={formData.spreadsheetUrl}
            onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
            placeholder="Enter Google Spreadsheet URL"
          />
          {isEditMode && (
            <Button
              type="button"
              onClick={handleProcessSpreadsheet}
              disabled={isProcessingSpreadsheet || !formData.spreadsheetUrl}
            >
              {isProcessingSpreadsheet ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Process Data'
              )}
            </Button>
          )}
        </div>
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            The spreadsheet should have &apos;trend&apos; and &apos;date&apos; columns
          </p>
          <p className="text-yellow-600 dark:text-yellow-500">
            Note: You must be signed in with Google to process spreadsheet data. If you&apos;re using regular login, you&apos;ll need to sign out and sign in with Google first.
          </p>
        </div>
      </div>

      {/* Add Data Preview Section */}
      {selectedTrend?.analytics && selectedTrend.analytics.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-left">Actual</th>
                  <th className="px-4 py-2 text-left">Forecast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedTrend.analytics[0].dates.map((date, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{new Date(date).toISOString().slice(0, 7)}</td>
                    <td className="px-4 py-2">{selectedTrend.analytics[0].values[index] ?? '—'}</td>
                    <td className="px-4 py-2">{selectedTrend.analytics[0].values[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              • Historical data points:{' '}
              {selectedTrend.analytics[0].dates.length -
                selectedTrend.analytics[0].values.filter((v) => v === null).length}
            </p>
            <p>
              • Forecast points:{' '}
              {selectedTrend.analytics[0].values.filter((v) => v === null).length}
            </p>
            <p>
              • Maximum value: {Math.max(...selectedTrend.analytics[0].values.map((v) => v ?? 0))}
            </p>
            <p>
              • Average value:{' '}
              {(
                selectedTrend.analytics[0].values.reduce((sum, v) => sum + (v ?? 0), 0) /
                selectedTrend.analytics[0].values.length
              ).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const handleDeleteTrend = async (trendId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/trends/${trendId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trend');
      }

      // Remove trend from local state
      setTrends(trends.filter((t) => t.id !== trendId));
      setSelectedTrend(null);
      setIsDetailModalOpen(false);
      toast.success('Trend deleted successfully');
    } catch {
      toast.error('Failed to delete trend');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDetailModal = () => {
    if (!selectedTrend) return null;

    // Convert analytics to chart data format
    const chartData = selectedTrend?.analytics?.[0]
      ? selectedTrend.analytics[0].dates.map((date, i) => ({
          month: new Date(date).toISOString().slice(0, 7),
          actual: selectedTrend.analytics[0].values[i],
          forecast: selectedTrend.analytics[0].values[i],
        }))
      : [];

    return (
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Trend Details"
      >
        <div className="space-y-6">
          {/* Trend Images */}
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {selectedTrend.imageUrls?.[selectedTrend.mainImageIndex] ? (
              <Image
                src={selectedTrend.imageUrls[selectedTrend.mainImageIndex]}
                alt={selectedTrend.title || 'Trend image'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          {/* Trend Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
              <p className="text-lg">{selectedTrend.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-base">{selectedTrend.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {selectedTrend.type}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p className="text-base">{new Date(selectedTrend.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Image Gallery */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">All Images</h3>
              <div className="grid grid-cols-4 gap-2">
                {selectedTrend.imageUrls?.map((url, index) => {
                  if (!url) return null;
                  return (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`${selectedTrend.title || 'Trend'} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === selectedTrend.mainImageIndex && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" onClick={() => handleEditClick(selectedTrend!)}>
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Trend</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the trend and remove
                    all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteTrend(selectedTrend.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>

          {/* Area Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Trend Data</h3>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Area type="monotone" dataKey="forecast" stroke="#82ca9d" />
            </AreaChart>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Trends</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add New Trend</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? 'Edit Trend' : 'Create New Trend'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'details' | 'images' | 'data')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              {renderDetailsTab()}
            </TabsContent>

            <TabsContent value="images" className="pt-4">
              {renderImagesTab()}
            </TabsContent>

            <TabsContent value="data" className="pt-4">
              {renderDataTab()}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Trend'
                  : 'Create Trend'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Trends Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend) => (
            <Card
              key={trend.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedTrend(trend);
                setIsDetailModalOpen(true);
              }}
            >
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                {trend.imageUrls?.[trend.mainImageIndex] ? (
                  <Image
                    src={trend.imageUrls[trend.mainImageIndex]}
                    alt={trend.title || 'Trend image'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{trend.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{trend.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(trend.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {trend.type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Render Detail Modal */}
      {renderDetailModal()}
    </div>
  );
}

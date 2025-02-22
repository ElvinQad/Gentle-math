import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Trend as DashboardTrend } from '@/types/dashboard';
import { Trend as ApiTrend } from '@/types/trends';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
import { signOut } from 'next-auth/react';
import { DetailsTab } from './tabs/DetailsTab';
import { ImagesTab } from './tabs/ImagesTab';
import { DataTab } from './tabs/DataTab';
import { TrendChart } from '@/components/ui/TrendChart';
import { calculateGrowthRate, getLatestValue } from '@/utils/trends';
import { Switch } from '@/components/ui/switch';
import { AgeSegmentPie } from '@/components/ui/AgeSegmentPie';

type Trend = Omit<DashboardTrend & ApiTrend, 'categoryId'> & {
  categoryId: string;
};

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

interface TrendFormData extends Omit<Partial<Trend>, 'title' | 'description'> {
  title: string;
  description: string;
  spreadsheetUrl: string;
  categoryId: string;
}

export function TrendsTab() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYearlyView, setIsYearlyView] = useState(false);
  const [formData, setFormData] = useState<TrendFormData>({
    title: '',
    description: '',
    type: '',
    imageUrls: [''],
    mainImageIndex: 0,
    spreadsheetUrl: '',
    categoryId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<'details' | 'images' | 'data'>('details');
  const [imageUrls, setImageUrls] = useState<ImagePreview[]>([{ url: '', isMain: true }]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessingSpreadsheet, setIsProcessingSpreadsheet] = useState(false);

  const handleFormDataChange = useCallback((data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

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
            categoryId: formData.categoryId,
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
      categoryId: '',
    });
    setImageUrls([{ url: '', isMain: true }]);
    setIsEditMode(false);
    setSelectedTrend(null);
    setCurrentTab('details');
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
      categoryId: trend.categoryId,
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

      console.log('Processing spreadsheet for trend:', {
        trendId,
        spreadsheetUrl: formData.spreadsheetUrl
      });

      const response = await fetch(`/api/admin/trends/${trendId}/spreadsheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetUrl: formData.spreadsheetUrl }),
      });

      const responseData = await response.json();
      console.log('Spreadsheet processing response:', responseData);

      if (!response.ok) {
        const errorMessage = responseData?.message || 'Failed to process spreadsheet';
        
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

      // Update the trends state with the new data
      setTrends(prevTrends => {
        const newTrends = prevTrends.map(t => 
          t.id === responseData.id ? { ...t, ...responseData } : t
        );
        console.log('Updating trends state:', {
          previous: prevTrends,
          updated: newTrends,
          receivedData: responseData
        });
        return newTrends;
      });

      // Also update the selected trend if it's the one being modified
      if (selectedTrend?.id === responseData.id) {
        setSelectedTrend(responseData);
      }
      
      toast.success('Spreadsheet data processed successfully');
    } catch (error) {
      console.error('Failed to process spreadsheet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process spreadsheet data');
    } finally {
      setIsProcessingSpreadsheet(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Trends</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 transition-colors"
        >
          Add New Trend
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? 'Edit Trend' : 'Create New Trend'}
        className="bg-[color:var(--background)] border border-[color:var(--border)] shadow-lg rounded-lg max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'details' | 'images' | 'data')}
            className="w-full"
          >
            <div className="sticky top-0 z-10 bg-[color:var(--background)] pb-4">
              <TabsList className="w-full grid grid-cols-3 bg-[color:var(--muted)] rounded-lg p-1">
                <TabsTrigger 
                  value="details"
                  className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                    data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                    data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                    hover:text-[color:var(--foreground)]/90"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="images"
                  className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                    data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                    data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                    hover:text-[color:var(--foreground)]/90"
                >
                  Images
                </TabsTrigger>
                <TabsTrigger 
                  value="data"
                  className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                    data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                    data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                    hover:text-[color:var(--foreground)]/90"
                >
                  Data
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4">
              <TabsContent value="details" className="focus-visible:outline-none">
                <DetailsTab formData={formData} setFormData={handleFormDataChange} />
              </TabsContent>

              <TabsContent value="images" className="focus-visible:outline-none">
                <ImagesTab 
                  imageUrls={imageUrls} 
                  setImageUrls={setImageUrls} 
                  onFileUpload={handleFileUpload} 
                />
              </TabsContent>

              <TabsContent value="data" className="focus-visible:outline-none">
                <DataTab 
                  formData={formData}
                  setFormData={handleFormDataChange}
                  selectedTrend={selectedTrend}
                  isProcessingSpreadsheet={isProcessingSpreadsheet}
                  onProcessSpreadsheet={handleProcessSpreadsheet}
                  isEditMode={isEditMode}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="sticky bottom-0 z-10 bg-[color:var(--background)] pt-4 border-t border-[color:var(--border)] mt-6">
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Trend' : 'Create Trend'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Trends Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[color:var(--primary)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[color:var(--muted-foreground)]">Loading trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend) => (
            <Card
              key={trend.id}
              className="group hover:shadow-lg transition-all duration-300 ease-out-expo bg-[color:var(--card)] border-[color:var(--border)] overflow-hidden"
              onClick={() => {
                setSelectedTrend(trend);
                setIsDetailModalOpen(true);
              }}
            >
              <div className="aspect-video relative overflow-hidden">
                {trend.imageUrls?.[trend.mainImageIndex] ? (
                  <Image
                    src={trend.imageUrls[trend.mainImageIndex]}
                    alt={trend.title || 'Trend image'}
                    fill
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[color:var(--muted)] flex items-center justify-center">
                    <span className="text-[color:var(--muted-foreground)]">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-[color:var(--card-foreground)]">{trend.title}</h3>
                <p className="text-sm text-[color:var(--muted-foreground)] mb-4 line-clamp-2">{trend.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[color:var(--muted-foreground)]">
                    {new Date(trend.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                    {trend.type}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Trend Details"
        className="bg-[color:var(--background)] border border-[color:var(--border)] shadow-lg rounded-lg max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto"
      >
        {selectedTrend && (
          <div className="space-y-4">
            {/* Trend Images */}
            <div className="h-[300px] sm:h-[400px] relative rounded-lg overflow-hidden bg-[color:var(--muted)]">
              {selectedTrend.imageUrls?.[selectedTrend.mainImageIndex] ? (
                <Image
                  src={selectedTrend.imageUrls[selectedTrend.mainImageIndex]}
                  alt={selectedTrend.title || 'Trend image'}
                  fill
                  className="object-cover transition-transform duration-700 ease-out-expo hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[color:var(--muted-foreground)]">No image</span>
                </div>
              )}
            </div>

            {/* Trend Information and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Title</h3>
                  <p className="text-lg font-medium text-[color:var(--foreground)]">{selectedTrend.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Description</h3>
                  <p className="text-base text-[color:var(--foreground)]">{selectedTrend.description}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Type</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                      {selectedTrend.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Created</h3>
                    <p className="text-sm text-[color:var(--foreground)]">
                      {new Date(selectedTrend.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Analytics Summary */}
                {selectedTrend.analytics?.[0] && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                      <h4 className="text-sm font-medium text-[color:var(--muted-foreground)]">Latest Value</h4>
                      <p className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                        {getLatestValue(selectedTrend.analytics[0].values)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                      <h4 className="text-sm font-medium text-[color:var(--muted-foreground)]">Growth Rate</h4>
                      <p className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                        {calculateGrowthRate(selectedTrend.analytics[0].values).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Chart and Images */}
              <div className="space-y-4">
                {/* Analytics Chart */}
                {selectedTrend.analytics?.[0] && (
                  <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Trend Analytics</h3>
                      {selectedTrend.analytics[0].dates.length > 10 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[color:var(--muted-foreground)]">
                            {isYearlyView ? 'Yearly View' : 'Monthly View'}
                          </span>
                          <Switch
                            checked={isYearlyView}
                            onCheckedChange={setIsYearlyView}
                            className="data-[state=checked]:bg-[color:var(--primary)]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-[300px] w-full">
                        <TrendChart
                          dates={selectedTrend.analytics[0].dates}
                          values={selectedTrend.analytics[0].values}
                          isYearlyView={isYearlyView}
                        />
                      </div>
                      {selectedTrend.analytics[0].ageSegments && (
                        <div className="h-[300px] w-full">
                          <div className="mb-2 text-sm font-medium text-[color:var(--muted-foreground)]">
                            Age Distribution
                          </div>
                          <AgeSegmentPie
                            data={selectedTrend.analytics[0].ageSegments.map(segment => ({
                              name: segment.name,
                              value: segment.value
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Gallery */}
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-3">Image Gallery</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTrend.imageUrls?.map((url, index) => {
                      if (!url) return null;
                      return (
                        <div key={index} className="group relative aspect-video rounded-lg overflow-hidden bg-[color:var(--muted)]">
                          <Image
                            src={url}
                            alt={`${selectedTrend.title || 'Trend'} - Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                          />
                          {index === selectedTrend.mainImageIndex && (
                            <div className="absolute top-2 right-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-xs px-2 py-0.5 rounded-full">
                              Main
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--border)]">
              <Button 
                variant="secondary" 
                onClick={() => handleEditClick(selectedTrend)}
                className="bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90 transition-colors"
              >
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/90 transition-colors"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[color:var(--background)] border border-[color:var(--border)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[color:var(--foreground)]">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[color:var(--muted-foreground)]">
                      This action cannot be undone. This will permanently delete the trend and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteTrend(selectedTrend.id)}
                      className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                variant="outline" 
                onClick={() => setIsDetailModalOpen(false)}
                className="border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--muted)]/50 transition-colors"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

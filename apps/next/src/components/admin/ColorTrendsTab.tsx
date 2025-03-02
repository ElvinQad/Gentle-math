'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { signOut } from 'next-auth/react';
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
import { TrendChart } from '@/components/ui/TrendChart';
import { ColorDetailsTab } from './tabs/ColorDetailsTab';
import { ImagesTab } from './tabs/ImagesTab';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RequestSheetsAccess } from '@/components/admin/RequestSheetsAccess';

interface ImagePreview {
  url: string;
  isMain: boolean;
}

interface ColorTrend {
  id: string;
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  createdAt: string;
  palette1?: string | null;
  palette2?: string | null;
  palette3?: string | null;
  palette4?: string | null;
  palette5?: string | null;
  analytics?: {
    dates: string[];
    values: number[];
    ageSegments?: Array<{ name: string; value: number }>;
  };
  spreadsheetUrl?: string;
}

interface ColorFormData {
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
  spreadsheetUrl: string;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function ColorTrendsTab() {
  const [colorTrends, setColorTrends] = useState<ColorTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<ColorTrend | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTab, setCurrentTab] = useState<'details' | 'images' | 'analytics'>('details');
  const [formData, setFormData] = useState<ColorFormData>({
    name: '',
    hex: '',
    imageUrl: '',
    popularity: 0,
    spreadsheetUrl: '',
  });
  const [imageUrls, setImageUrls] = useState<ImagePreview[]>([]);
  const [isYearlyView, setIsYearlyView] = useState(false);
  const [isProcessingSpreadsheet, setIsProcessingSpreadsheet] = useState(false);

  const fetchColorTrends = async () => {
    try {
      const response = await fetch('/api/admin/colors');
      if (!response.ok) throw new Error('Failed to fetch color trends');
      const data = await response.json();
      setColorTrends(data);
    } catch (error) {
      toast.error('Failed to load color trends');
      console.error('Error fetching color trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColorTrends();
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
        // First, get the presigned URL from our API
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { presignedUrl, publicUrl } = await response.json();

        // Upload the file using the presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        uploadedUrls.push(publicUrl);
      }

      // Update imageUrls state with the new URLs
      setImageUrls((prev) =>
        [...prev, ...uploadedUrls.map((url) => ({ url, isMain: prev.length === 0 }))].filter(
          (img) => isValidUrl(img.url),
        ),
      );

      toast.success('Images uploaded successfully');
      return uploadedUrls; // Return the array of uploaded URLs
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
      return []; // Return empty array on error
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mainImage = imageUrls.find((img) => img.isMain);
      if (!mainImage || !isValidUrl(mainImage.url)) {
        throw new Error('Please select a main image');
      }

      const response = await fetch(
        `/api/admin/colors${isEditMode && selectedTrend ? `/${selectedTrend.id}` : ''}`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            imageUrl: mainImage.url,
          }),
        },
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} color trend`);
      }

      await fetchColorTrends();
      setIsModalOpen(false);
      resetForm();
      toast.success(`Color trend ${isEditMode ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} color trend`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/colors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete color trend');
      }

      await fetchColorTrends();
      setIsDetailModalOpen(false);
      toast.success('Color trend deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete color trend');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hex: '',
      imageUrl: '',
      popularity: 0,
      spreadsheetUrl: '',
    });
    setImageUrls([]);
    setIsEditMode(false);
    setSelectedTrend(null);
    setCurrentTab('details');
  };

  const handleEditClick = (trend: ColorTrend) => {
    setSelectedTrend(trend);
    setIsEditMode(true);
    setFormData({
      name: trend.name,
      hex: trend.hex,
      imageUrl: trend.imageUrl,
      popularity: trend.popularity,
      spreadsheetUrl: trend.spreadsheetUrl || '',
    });
    setImageUrls([{ url: trend.imageUrl, isMain: true }]);
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

      // If we're in edit mode, use the selected trend ID
      // If we're creating a new trend, first create it and then process the spreadsheet
      let trendId = selectedTrend?.id;

      if (!trendId) {
        // Create the trend first
        const mainImage = imageUrls.find((img) => img.isMain);
        if (!mainImage || !isValidUrl(mainImage.url)) {
          throw new Error('Please select a main image');
        }

        const createResponse = await fetch('/api/admin/colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            imageUrl: mainImage.url,
          }),
        });

        if (!createResponse.ok) {
          const data = await createResponse.json();
          throw new Error(data.message || 'Failed to create color trend');
        }

        const newTrend = await createResponse.json();
        trendId = newTrend.id;
        setSelectedTrend(newTrend);
      }

      console.log('Processing spreadsheet for trend:', {
        trendId,
        spreadsheetUrl: formData.spreadsheetUrl
      });

      const response = await fetch(`/api/admin/colors/${trendId}/spreadsheet`, {
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
      setColorTrends(prevTrends => {
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

      // If we just created a new trend, close the modal and reset the form
      if (!selectedTrend?.id) {
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to process spreadsheet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process spreadsheet data');
    } finally {
      setIsProcessingSpreadsheet(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Color Trends</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 transition-colors"
        >
          Add New Color
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? 'Edit Color Trend' : 'Create New Color Trend'}
        className="bg-[color:var(--background)] border border-[color:var(--border)] shadow-lg rounded-lg max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'details' | 'images' | 'analytics')}
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
                  value="analytics"
                  className="rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out-expo
                    data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                    data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                    hover:text-[color:var(--foreground)]/90"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4">
              <TabsContent value="details" className="focus-visible:outline-none">
                <ColorDetailsTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="images" className="focus-visible:outline-none">
                <ImagesTab 
                  imageUrls={imageUrls} 
                  setImageUrls={setImageUrls} 
                  onFileUpload={handleFileUpload} 
                />
              </TabsContent>

              <TabsContent value="analytics" className="focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[color:var(--foreground)]">Analytics Data</h3>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          Connect a Google Spreadsheet to visualize trend data
                        </p>
                      </div>
                      <RequestSheetsAccess />
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label 
                          htmlFor="spreadsheetUrl"
                          className="text-sm font-medium text-[color:var(--muted-foreground)]"
                        >
                          Google Spreadsheet URL
                        </Label>
                        <Input
                          id="spreadsheetUrl"
                          value={formData.spreadsheetUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="bg-[color:var(--background)] border border-[color:var(--border)]
                            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
                        />
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          Enter the URL of your Google Spreadsheet containing the trend data
                        </p>
                      </div>

                      {formData.spreadsheetUrl && (
                        <Button
                          type="button"
                          onClick={handleProcessSpreadsheet}
                          disabled={isProcessingSpreadsheet || !formData.spreadsheetUrl}
                          className="w-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
                        >
                          {isProcessingSpreadsheet ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Processing Spreadsheet...
                            </>
                          ) : (
                            'Process Spreadsheet'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedTrend?.analytics && (
                    <div className="p-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Trend Analytics</h3>
                        {selectedTrend.analytics.dates.length > 10 && (
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
                            dates={selectedTrend.analytics.dates}
                            values={selectedTrend.analytics.values}
                            isYearlyView={isYearlyView}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  isEditMode ? 'Update Color' : 'Create Color'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colorTrends.map((trend) => (
          <Card
            key={trend.id}
            className="group hover:shadow-lg transition-all duration-300 ease-out-expo bg-[color:var(--card)] border-[color:var(--border)] overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedTrend(trend);
              setIsDetailModalOpen(true);
            }}
          >
            <div className="relative h-48">
              <Image
                src={trend.imageUrl}
                alt={trend.name}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0 opacity-75 transition-opacity group-hover:opacity-60"
                style={{ backgroundColor: trend.hex }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-6 h-6 rounded-full border-2 border-[color:var(--border)]"
                  style={{ backgroundColor: trend.hex }}
                />
                <h3 className="text-lg font-semibold text-[color:var(--card-foreground)]">
                  {trend.name}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--muted-foreground)]">Popularity</span>
                  <span className="text-[color:var(--primary)] font-medium">{trend.popularity}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--muted-foreground)]">Created</span>
                  <span className="text-[color:var(--foreground)]">
                    {new Date(trend.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Color Trend Details"
        className="bg-[color:var(--background)] border border-[color:var(--border)] shadow-lg rounded-lg max-w-3xl w-[90vw] max-h-[85vh] overflow-y-auto"
      >
        {selectedTrend && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative md:w-1/3 h-[200px] rounded-lg overflow-hidden">
                <Image
                  src={selectedTrend.imageUrl}
                  alt={selectedTrend.name}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 opacity-75"
                  style={{ backgroundColor: selectedTrend.hex }}
                />
              </div>
              
              <div className="md:w-2/3 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Name</h3>
                  <p className="text-lg font-medium text-[color:var(--foreground)]">{selectedTrend.name}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Hex Color</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-[color:var(--border)]"
                        style={{ backgroundColor: selectedTrend.hex }}
                      />
                      <span className="text-sm text-[color:var(--foreground)]">{selectedTrend.hex}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Popularity</h3>
                    <p className="text-sm text-[color:var(--foreground)]">{selectedTrend.popularity}%</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Created</h3>
                    <p className="text-sm text-[color:var(--foreground)]">
                      {new Date(selectedTrend.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="palette" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-[color:var(--muted)] rounded-lg p-1">
                <TabsTrigger value="palette" className="rounded-md px-3 py-1.5 text-sm font-medium transition-all 
                  data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                  data-[state=active]:shadow-sm hover:text-[color:var(--foreground)]/90">
                  Color Palette
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-md px-3 py-1.5 text-sm font-medium transition-all 
                  data-[state=active]:bg-[color:var(--background)] data-[state=active]:text-[color:var(--foreground)]
                  data-[state=active]:shadow-sm hover:text-[color:var(--foreground)]/90">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="palette" className="focus-visible:outline-none">
                {(selectedTrend.palette1 || selectedTrend.palette2 || selectedTrend.palette3 || 
                  selectedTrend.palette4 || selectedTrend.palette5) ? (
                  <div className="p-3 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                    <h3 className="text-sm font-medium text-[color:var(--muted-foreground)] mb-3">Color Palette</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        selectedTrend.palette1,
                        selectedTrend.palette2,
                        selectedTrend.palette3,
                        selectedTrend.palette4,
                        selectedTrend.palette5
                      ].filter(Boolean).map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border border-[color:var(--border)]"
                            style={{ backgroundColor: color || undefined }}
                          />
                          <span className="text-xs font-mono text-[color:var(--muted-foreground)]">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[color:var(--muted-foreground)]">
                    No palette colors defined
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="focus-visible:outline-none">
                {selectedTrend.analytics?.dates && selectedTrend.analytics.values ? (
                  <div className="p-3 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">Trend Analytics</h3>
                      {selectedTrend.analytics.dates.length > 10 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            {isYearlyView ? 'Yearly' : 'Monthly'}
                          </span>
                          <Switch
                            checked={isYearlyView}
                            onCheckedChange={setIsYearlyView}
                            className="data-[state=checked]:bg-[color:var(--primary)]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="h-[200px] w-full">
                      <TrendChart
                        dates={selectedTrend.analytics.dates}
                        values={selectedTrend.analytics.values}
                        isYearlyView={isYearlyView}
                      />
                    </div>
                    
               
                  </div>
                ) : (
                  <div className="text-center py-6 text-[color:var(--muted-foreground)]">
                    No analytics data available
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-24 pt-4 border-t border-[color:var(--border)]">
              <Button
                variant="secondary"
                onClick={() => handleEditClick(selectedTrend)}
                className="bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90"
              >
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/90"
                  >
                    {isDeleting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[color:var(--background)] border border-[color:var(--border)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[color:var(--foreground)]">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[color:var(--muted-foreground)]">
                      This action cannot be undone. This will permanently delete the color trend and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      className="bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90"
                      disabled={isDeleting}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(selectedTrend.id)}
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
                className="border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--muted)]/50"
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
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileJson, Code, Info, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface S3Image {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}




export function BulkImportTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [s3Images] = useState<S3Image[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentField] = useState<{
    type: 'category' | 'trend' | 'color';
    index: number;
    field: string;
  } | null>(null);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonData(JSON.stringify(parsed, null, 2));
      } catch (error) {
        toast.error(`Invalid JSON file: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonData) {
      toast.error('Please provide data to import');
      return;
    }

    try {
      // Validate JSON format before sending
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
        console.log('Parsed data:', parsedData); // Debug log
      } catch (e) {
        console.error('JSON parse error:', e);
        toast.error('Invalid JSON format');
        return;
      }

      setIsLoading(true);

      // Log the request payload
      const requestBody = JSON.stringify(parsedData);
      console.log('Request payload length:', requestBody.length);
      console.log('Request payload preview:', requestBody.slice(0, 1000) + '...');

      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Log the raw response
      const rawResponse = await response.text();
      console.log('Raw response length:', rawResponse.length);
      console.log('Raw response:', rawResponse);

      let result;
      try {
        result = rawResponse ? JSON.parse(rawResponse) : null;
        console.log('Parsed response:', result);
      } catch (e) {
        console.error('Failed to parse response:', {
          error: e,
          rawResponse,
          responseLength: rawResponse.length
        });
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok || !result?.success) {
        const error = result?.error || 'Failed to import data';
        console.error('Import failed:', {
          status: response.status,
          error,
          details: result?.details
        });
        throw new Error(error);
      }

      if (result.stats) {
        const message = `Import successful: ${result.stats.categories} categories, ${result.stats.trends} trends, ${result.stats.colors} colors`;
        console.log(message);
        toast.success(message);
      } else {
        console.log('Import successful but no stats returned');
        toast.success('Import successful');
      }
      
      setJsonData('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/admin/bulk-export');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to export data');
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gentle-math-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Successfully exported ${result.stats.categories} categories, ${result.stats.trends} trends, and ${result.stats.colors} colors`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Are you sure you want to clean up unused data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsCleaning(true);
      const response = await fetch('/api/admin/bulk-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: { orphaned: true },
          trends: { orphaned: true },
          colors: { unused: true }
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to clean up data');
      }

      toast.success(`Cleaned up ${result.stats.categories} categories, ${result.stats.trends} trends, and ${result.stats.colors} colors`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to clean up data');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleReset = async () => {
    const confirmation = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL categories, trends, colors, and their associated data. This action cannot be undone. Are you absolutely sure?'
    );

    if (!confirmation) return;

    // Double confirmation for safety
    const doubleConfirmation = window.confirm(
      '⚠️ FINAL WARNING: You are about to delete all data. Type "RESET" to confirm this destructive action.'
    );

    if (!doubleConfirmation) return;

    const userInput = window.prompt('Type "RESET" to confirm:');
    if (userInput !== 'RESET') {
      toast.error('Reset cancelled - confirmation text did not match');
      return;
    }

    try {
      setIsResetting(true);
      const response = await fetch('/api/admin/bulk-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: { all: true },
          trends: { all: true },
          colors: { all: true }
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reset data');
      }

      toast.success(`Successfully reset all data. Deleted: ${result.stats.categories} categories, ${result.stats.trends} trends, and ${result.stats.colors} colors`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };


  const handleImageSelection = () => {
    if (!currentField || !jsonData) return;

    try {
      const data = JSON.parse(jsonData);
      const { type, index, field } = currentField;

      if (field === 'imageUrls') {
        data[`${type}s`][index][field] = selectedImages;
      } else {
        data[`${type}s`][index][field] = selectedImages[0];
      }

      setJsonData(JSON.stringify(data, null, 2));
      setIsImagePickerOpen(false);
      setSelectedImages([]);
    } catch {
      toast.error('Failed to update images in JSON');
    }
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Bulk Import</h2>
          <p className="text-muted-foreground">
            Import multiple categories, trends, and colors at once using JSON format
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Data
          </Button>
          <Button
            variant="outline"
            onClick={handleCleanup}
            disabled={isCleaning}
            className="gap-2"
          >
            {isCleaning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clean Up
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isResetting}
            className="gap-2"
          >
            {isResetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Reset Data
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Upload JSON
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Paste JSON
            </TabsTrigger>
            <TabsTrigger value="format" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Data Format
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="border-2 border-dashed rounded-xl p-10 text-center space-y-6 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
              <div className="animate-bounce-slow">
                <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="text-lg">Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="application/json"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  or drag and drop your JSON file here
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full h-[500px] font-mono text-sm p-6 rounded-lg border bg-background/50 focus:bg-background transition-colors"
                  placeholder="Paste your JSON data here..."
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                  {jsonData ? `${JSON.stringify(jsonData).length} characters` : ''}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="format" className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-xl font-semibold mb-4">Data Format</h3>
              <p className="text-muted-foreground mb-4">
                Your JSON data should follow this structure for successful import:
              </p>
              <pre className="bg-muted/50 p-6 rounded-xl overflow-auto text-sm">
                {JSON.stringify(
                  {
                    "categories": [
                      {
                        "name": "Fashion 2024",
                        "slug": "fashion-2024",
                        "description": "Fashion trends and forecasts for 2024",
                        "imageUrl": "https://example.com/fashion-2024.jpg"
                        // Top-level category (no parentSlug)
                      },
                      {
                        "name": "Summer Fashion 2024",
                        "slug": "summer-fashion-2024",
                        "description": "Latest summer fashion trends for 2024",
                        "imageUrl": "https://example.com/summer-fashion.jpg",
                        "parentSlug": "fashion-2024" // Child of Fashion 2024
                      },
                      {
                        "name": "Beach Wear",
                        "slug": "beach-wear-2024",
                        "description": "Trending beach wear and accessories",
                        "imageUrl": "https://example.com/beach-wear.jpg",
                        "parentSlug": "summer-fashion-2024" // Nested under Summer Fashion
                      },
                      {
                        "name": "Sustainable Living",
                        "slug": "sustainable-living",
                        "description": "Eco-friendly lifestyle trends",
                        "imageUrl": "https://example.com/sustainable.jpg"
                      },
                      {
                        "name": "Zero Waste",
                        "slug": "zero-waste",
                        "description": "Zero waste lifestyle and practices",
                        "imageUrl": "https://example.com/zero-waste.jpg",
                        "parentSlug": "sustainable-living"
                      }
                    ],
                    "trends": [
                      {
                        "title": "Coastal Grandmother Style",
                        "description": "The relaxed, elegant aesthetic inspired by coastal living and mature sophistication",
                        "type": "Fashion",
                        "imageUrls": [
                          "https://example.com/coastal-1.jpg",
                          "https://example.com/coastal-2.jpg",
                          "https://example.com/coastal-3.jpg"
                        ],
                        "mainImageIndex": 0, // Index of the main image in imageUrls array
                        "categorySlug": "summer-fashion-2024",
                        "analytics": {
                          "dates": [
                            "2024-01-01", "2024-02-01", "2024-03-01",
                            "2024-04-01", "2024-05-01", "2024-06-01"
                          ],
                          "values": [65, 72, 78, 85, 92, 95], // Shows growing trend
                          "ageSegments": [
                            { "name": "18-24", "value": 15 },
                            { "name": "25-34", "value": 25 },
                            { "name": "35-44", "value": 35 },
                            { "name": "45-54", "value": 15 },
                            { "name": "55+", "value": 10 }
                          ]
                        }
                      },
                      {
                        "title": "Biodegradable Packaging",
                        "description": "Innovative approaches to eco-friendly packaging in retail",
                        "type": "Sustainability",
                        "imageUrls": [
                          "https://example.com/bio-pack-1.jpg",
                          "https://example.com/bio-pack-2.jpg"
                        ],
                        "mainImageIndex": 0,
                        "categorySlug": "zero-waste",
                        "analytics": {
                          "dates": [
                            "2023-07-01", "2023-10-01",
                            "2024-01-01", "2024-04-01"
                          ],
                          "values": [45, 60, 75, 88], // Quarterly data showing growth
                          "ageSegments": [
                            { "name": "18-24", "value": 30 },
                            { "name": "25-34", "value": 40 },
                            { "name": "35-44", "value": 20 },
                            { "name": "45+", "value": 10 }
                          ]
                        }
                      }
                    ],
                    "colors": [
                      {
                        "name": "Digital Lavender",
                        "hex": "#E6E6FA", // Must be a valid hex color code
                        "imageUrl": "https://example.com/lavender.jpg",
                        "popularity": 85, // Color popularity (0-100)
                        "palette1": "#E6E6FA", // Main color
                        "palette2": "#F8F8FF", // Light accent
                        "palette3": "#DCD0FF", // Medium accent
                        "palette4": "#B5A6E4", // Dark accent
                        "palette5": "#9F91CC", // Deepest shade
                        "analytics": {
                          "dates": [
                            "2023-12-01", "2024-01-01", "2024-02-01",
                            "2024-03-01", "2024-04-01", "2024-05-01"
                          ],
                          "values": [70, 75, 82, 88, 85, 83], // Shows peak and slight decline
                          "ageSegments": [
                            { "name": "18-24", "value": 40 },
                            { "name": "25-34", "value": 35 },
                            { "name": "35-44", "value": 15 },
                            { "name": "45+", "value": 10 }
                          ]
                        }
                      },
                      {
                        "name": "Ocean Teal",
                        "hex": "#469A8F",
                        "imageUrl": "https://example.com/teal.jpg",
                        "popularity": 78,
                        "palette1": "#469A8F", // Main teal
                        "palette2": "#62B5AA", // Light teal
                        "palette3": "#2A7D72", // Dark teal
                        "palette4": "#A3D5CE", // Pale teal
                        "palette5": "#1B4A44", // Deep teal
                        "analytics": {
                          "dates": [
                            "2024-01-01", "2024-02-01", "2024-03-01",
                            "2024-04-01", "2024-05-01", "2024-06-01"
                          ],
                          "values": [65, 70, 75, 78, 82, 85], // Steady growth
                          "ageSegments": [
                            { "name": "18-24", "value": 25 },
                            { "name": "25-34", "value": 45 },
                            { "name": "35-44", "value": 20 },
                            { "name": "45+", "value": 10 }
                          ]
                        }
                      }
                    ]
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isImagePickerOpen} onOpenChange={setIsImagePickerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {s3Images.map((image) => (
                <div
                  key={image.key}
                  className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImages.includes(image.url)
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2'
                  }`}
                  onClick={() => {
                    if (currentField?.field === 'imageUrls') {
                      setSelectedImages((prev) =>
                        prev.includes(image.url)
                          ? prev.filter((url) => url !== image.url)
                          : [...prev, image.url],
                      );
                    } else {
                      setSelectedImages([image.url]);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 truncate">
                    {image.key}
                  </div>
                  <Image
                    src={image.url}
                    alt={image.key}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedImages.length} image(s) selected
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsImagePickerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImageSelection}>
                  Confirm Selection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end sticky bottom-6 z-50">
        <Button 
          onClick={handleImport} 
          disabled={isLoading || !jsonData}
          size="lg"
          className="shadow-lg"
        >
          {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isLoading ? 'Importing...' : 'Import Data'}
        </Button>
      </div>
    </div>
  );
} 
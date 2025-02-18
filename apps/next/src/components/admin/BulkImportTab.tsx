import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sampleData = {
  categories: [
    {
      name: 'Upperware',
      slug: 'upperware',
      description: 'Upper body clothing trends',
    },
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'T-shirt trends',
      parentSlug: 'upperware',
    },
  ],
  trends: [
    {
      title: 'Oversized T-Shirts',
      description: 'Oversized t-shirts are making a comeback',
      type: 'Clothing',
      imageUrls: ['https://example.com/image1.jpg'],
      mainImageIndex: 0,
      categorySlug: 't-shirts',
      analytics: {
        dates: ['2024-01-01', '2024-02-01', '2024-03-01'],
        values: [10, 20, 30],
        ageSegments: [
          { name: '18-24', value: 30 },
          { name: '25-34', value: 40 },
        ],
      },
    },
  ],
  colors: [
    {
      name: 'Forest Green',
      hex: '#228B22',
      imageUrl: 'https://example.com/forest-green.jpg',
      popularity: 85,
    },
  ],
};

export function BulkImportTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Try to parse and format the JSON
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
      const data = JSON.parse(jsonData);
      setIsLoading(true);

      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import data');
      }

      const result = await response.json();
      toast.success(
        `Import successful: ${result.stats.categories} categories, ${result.stats.trends} trends, ${result.stats.colors} colors`,
      );
      setJsonData('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setJsonData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Bulk Import</h2>
        <p className="text-muted-foreground">
          Import multiple categories, trends, and colors at once using JSON
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload JSON</TabsTrigger>
          <TabsTrigger value="paste">Paste JSON</TabsTrigger>
          <TabsTrigger value="format">Data Format</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="application/json"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="text-sm text-muted-foreground">or drag and drop</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleLoadSample}>
                Load Sample Data
              </Button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-[400px] font-mono text-sm p-4 rounded-lg border bg-background"
              placeholder="Paste your JSON data here..."
            />
          </div>
        </TabsContent>

        <TabsContent value="format" className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h3>Data Format</h3>
            <p>The JSON data should follow this structure:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(
                {
                  categories: [
                    {
                      name: 'Category Name',
                      slug: 'category-slug',
                      description: 'Optional description',
                      parentSlug: 'optional-parent-category-slug',
                    },
                  ],
                  trends: [
                    {
                      title: 'Trend Title',
                      description: 'Trend Description',
                      type: 'Trend Type',
                      imageUrls: ['https://...'],
                      mainImageIndex: 0,
                      categorySlug: 'optional-category-slug',
                      analytics: {
                        dates: ['2024-01-01'],
                        values: [10],
                        ageSegments: [{ name: '18-24', value: 30 }],
                      },
                    },
                  ],
                  colors: [
                    {
                      name: 'Color Name',
                      hex: '#RRGGBB',
                      imageUrl: 'https://...',
                      popularity: 85,
                    },
                  ],
                },
                null,
                2,
              )}
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleImport} disabled={isLoading || !jsonData}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Import Data
        </Button>
      </div>
    </div>
  );
} 
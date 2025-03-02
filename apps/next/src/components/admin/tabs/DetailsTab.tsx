import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_ENDPOINTS } from '@/constants/admin';

interface Category {
  id: string;
  name: string;
  children: Category[];
}

interface DetailsTabProps {
  formData: {
    title: string;
    description: string;
    categoryId: string;
  };
  setFormData: (data: Partial<{ 
    title: string; 
    description: string; 
    categoryId: string; 
    imageUrls: string[]; 
    mainImageIndex: number; 
    spreadsheetUrl: string; 
  }>) => void;
}

export function DetailsTab({ formData, setFormData }: DetailsTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/list`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderCategoryOptions = (categories: Category[], level = 0): React.ReactNode[] => {
    return categories.flatMap((category) => {
      const items: React.ReactNode[] = [
        <SelectItem
          key={`${level}-${category.id}`}
          value={category.id}
          className={`cursor-pointer transition-colors duration-200 ${
            level > 0 ? 'pl-[calc(0.75rem_+_1.5rem_*_' + level + ')]' : ''
          } hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)] data-[highlighted]:bg-[color:var(--accent)]/10 data-[highlighted]:text-[color:var(--accent)]`}
        >
          {level > 0 ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-[color:var(--muted-foreground)]">└</span>
              {category.name}
            </span>
          ) : (
            category.name
          )}
        </SelectItem>
      ];

      if (category.children?.length > 0) {
        items.push(...renderCategoryOptions(category.children, level + 1));
      }

      return items;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="title" 
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ title: e.target.value })}
          placeholder="Enter a descriptive title for the trend"
          required
          className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            placeholder:text-[color:var(--muted-foreground)]/50"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose a clear, concise title that describes the trend
        </p>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="description"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ description: e.target.value })}
          placeholder="Provide a detailed description of the trend and its significance"
          required
          rows={4}
          className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            resize-none min-h-[120px] placeholder:text-[color:var(--muted-foreground)]/50"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Include key details about the trend, its impact, and relevance
        </p>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="category"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Category
        </Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value: string) => setFormData({ categoryId: value })}
        >
          <SelectTrigger
            id="category"
            className="w-full bg-[color:var(--background)] border border-[color:var(--border)]
              focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
              h-[42px]"
          >
            <SelectValue 
              placeholder={
                isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-[color:var(--primary)] border-t-transparent rounded-full" />
                    Loading categories...
                  </span>
                ) : (
                  "Select a category"
                )
              } 
            />
          </SelectTrigger>
          <SelectContent 
            className="relative z-50 min-w-[200px] overflow-hidden rounded-md border border-[color:var(--border)] bg-[color:var(--background)] shadow-md animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <div className="max-h-[300px] overflow-auto p-1 scrollbar-thin scrollbar-thumb-[color:var(--border)] scrollbar-track-transparent">
              {categories.length > 0 ? (
                renderCategoryOptions(categories)
              ) : (
                <SelectItem value="_empty" disabled className="text-[color:var(--muted-foreground)] py-2 px-4">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-[color:var(--primary)] border-t-transparent rounded-full" />
                      Loading categories...
                    </span>
                  ) : (
                    "No categories available"
                  )}
                </SelectItem>
              )}
            </div>
          </SelectContent>
        </Select>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose the most appropriate category for your trend
        </p>
      </div>
    </div>
  );
} 
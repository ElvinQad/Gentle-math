import React, { useEffect, useState, ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  setFormData: (data: Partial<{ title: string; description: string; categoryId: string; imageUrls: string[]; mainImageIndex: number; spreadsheetUrl: string; }>) => void;
}

export function DetailsTab({ formData, setFormData }: DetailsTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories/list');
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

  const renderCategoryOptions = (categories: Category[], level = 0): ReactNode[] => {
    return categories.flatMap((category) => {
      const items: ReactNode[] = [
        <SelectItem
          key={`${level}-${category.id}`}
          value={category.id}
          className="cursor-pointer hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]"
        >
          {'\u00A0'.repeat(level * 2)}{level > 0 ? '└ ' : ''}{category.name}
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
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
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
            resize-none min-h-[120px]"
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
              focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
          >
            <SelectValue placeholder={isLoading ? "Loading categories..." : "Select a category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.length > 0 ? (
              renderCategoryOptions(categories)
            ) : (
              <SelectItem value="_empty" disabled>
                {isLoading ? "Loading..." : "No categories available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose the most appropriate category for your trend
        </p>
      </div>
    </div>
  );
} 
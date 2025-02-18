import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  children: Category[];
  trends: { id: string; title: string }[];
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setCategories((prev) => [...prev, data]);
      setNewCategory({ name: '', slug: '', description: '', parentId: '' });
      toast.success('Category created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCategory((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const renderCategoryTree = (category: Category, level = 0) => {
    return (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1">
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-muted-foreground">
              {category.trends.length} trends · {category.children.length} subcategories
            </div>
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
        {category.children.map((child) => renderCategoryTree(child, level + 1))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
        <p className="text-muted-foreground">
          Organize your trends into categories and subcategories
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-medium">Add New Category</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newCategory.name}
              onChange={handleNameChange}
              placeholder="Category name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={newCategory.slug}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="category-slug"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={newCategory.description}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Category description"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Parent Category (optional)</label>
            <select
              value={newCategory.parentId}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">None (Top Level)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Add Category
        </Button>
      </form>

      <div className="border rounded-lg divide-y">
        {categories.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No categories yet</div>
        ) : (
          categories.filter((c) => !c.parentId).map((category) => renderCategoryTree(category))
        )}
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, Upload, Plus, FolderTree, Edit2, MoreVertical, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { TrendsGallery } from '@/components/dashboard/TrendsGallery';
import type { Trend } from '@/types/dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  children: Category[];
  trends: Trend[];
}

interface Breadcrumb {
  id: string;
  name: string;
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleImageUpload = async (file: File) => {
    try {
      // First, get the presigned URL from our API
      const contentHash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
        .then(hash => Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''));

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          contentHash,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, publicUrl, isDuplicate } = await response.json();

      // If it's a duplicate, just return the existing URL
      if (isDuplicate) {
        return publicUrl;
      }

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

      return publicUrl;
    } catch (error) {
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCategory, imageUrl }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setCategories((prev) => [...prev, data]);
      setNewCategory({ name: '', slug: '', description: '', parentId: '' });
      setImageFile(null);
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

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setBreadcrumbs(prev => {
      const existingIndex = prev.findIndex(b => b.id === category.id);
      if (existingIndex !== -1) {
        return prev.slice(0, existingIndex + 1);
      }
      return [...prev, { id: category.id, name: category.name }];
    });
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedCategory(null);
      setBreadcrumbs([]);
      return;
    }

    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const categoryId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
    const category = findCategoryById(categories, categoryId);
    setSelectedCategory(category || null);
  };

  const findCategoryById = (categories: Category[], id: string): Category | null => {
    for (const category of categories) {
      if (category.id === id) return category;
      if (category.children.length > 0) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory({
      ...category,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      parentId: category.parentId || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsSubmitting(true);

    try {
      let imageUrl = editingCategory.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          imageUrl,
          parentId: editingCategory.parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const updatedCategory = await response.json();
      setCategories(prev => updateCategoryInTree(prev, updatedCategory));
      setEditingCategory(null);
      setImageFile(null);
      toast.success('Category updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategoryInTree = (categories: Category[], updatedCategory: Category): Category[] => {
    return categories.map(category => {
      if (category.id === updatedCategory.id) {
        return { ...updatedCategory, children: category.children };
      }
      if (category.children.length > 0) {
        return { ...category, children: updateCategoryInTree(category.children, updatedCategory) };
      }
      return category;
    });
  };

  const CategoryActions = ({ category }: { category: Category }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditClick(category)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
          <p className="text-[color:var(--muted-foreground)]">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (editingCategory) {
    return (
      <Card className="border-[color:var(--border)] bg-[color:var(--background)]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Edit Category</CardTitle>
          <CardDescription>Update the category details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Name</label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory(prev => ({
                      ...prev!,
                      name,
                      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    }));
                  }}
                  placeholder="Category name"
                  required
                  className="bg-[color:var(--background-secondary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Slug</label>
                <Input
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev!, slug: e.target.value }))}
                  placeholder="category-slug"
                  required
                  className="bg-[color:var(--background-secondary)]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Description (optional)</label>
                <Textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))}
                  placeholder="Category description"
                  className="bg-[color:var(--background-secondary)] min-h-[100px]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Image</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="flex-1 bg-[color:var(--background-secondary)]"
                  />
                  {(imageFile || editingCategory?.imageUrl) && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[color:var(--border)]">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : editingCategory?.imageUrl || ''}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setEditingCategory(prev => ({ ...prev!, imageUrl: '' }));
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Parent Category (optional)</label>
                <select
                  value={editingCategory.parentId || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev!, parentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-current bg-[color:var(--background-secondary)] text-[color:var(--foreground)]"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory.id && !isDescendant(c, editingCategory.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBreadcrumbClick(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[color:var(--background)] hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories</span>
        </motion.button>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-[color:var(--muted-foreground)]" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBreadcrumbClick(index)}
              className="px-3 py-1.5 rounded-lg bg-[color:var(--background)] hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition-colors"
            >
              {crumb.name}
            </motion.button>
          </div>
        ))}
      </nav>

      {/* Add New Category Form */}
      <Card className="border-[color:var(--border)] bg-[color:var(--background)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Plus className="w-4 h-4" />
            Add New Category
          </CardTitle>
          <CardDescription>Create a new category to organize your trends</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Name</label>
                <Input
                  value={newCategory.name}
                  onChange={handleNameChange}
                  placeholder="Category name"
                  required
                  className="bg-[color:var(--background-secondary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Slug</label>
                <Input
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                  required
                  className="bg-[color:var(--background-secondary)]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Description (optional)</label>
                <Textarea
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description"
                  className="bg-[color:var(--background-secondary)] min-h-[100px]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Image</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="flex-1 bg-[color:var(--background-secondary)]"
                  />
                  {imageFile && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[color:var(--border)]">
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-[color:var(--foreground)]">Parent Category (optional)</label>
                <select
                  value={newCategory.parentId}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-current bg-[color:var(--background-secondary)] text-[color:var(--foreground)]"
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
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category Content */}
      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key={selectedCategory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {selectedCategory.name}
                  <CategoryActions category={selectedCategory} />
                </h2>
                {selectedCategory.description && (
                  <p className="text-[color:var(--muted-foreground)] mt-1">{selectedCategory.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                if (breadcrumbs.length <= 1) {
                  setSelectedCategory(null);
                  setBreadcrumbs([]);
                } else {
                  const newBreadcrumbs = breadcrumbs.slice(0, -1);
                  setBreadcrumbs(newBreadcrumbs);
                  const categoryId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
                  const category = findCategoryById(categories, categoryId);
                  setSelectedCategory(category || null);
                }
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Subcategories */}
            {selectedCategory.children.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FolderTree className="w-4 h-4" />
                  Subcategories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.children.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative"
                    >
                      <div className="absolute top-2 right-2 z-10">
                        <CategoryActions category={category} />
                      </div>
                      <div onClick={() => handleCategoryClick(category)} className="cursor-pointer">
                        <Card className="h-full border-[color:var(--border)] bg-[color:var(--background)] transition-all duration-300 hover:shadow-lg hover:shadow-[color:var(--primary)]/5">
                          <div className="relative aspect-video">
                            {category.imageUrl ? (
                              <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-[color:var(--muted)] flex items-center justify-center rounded-t-lg">
                                <FolderTree className="w-8 h-8 text-[color:var(--muted-foreground)]" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-lg mb-1 line-clamp-1">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-[color:var(--muted-foreground)] mb-2 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-sm text-[color:var(--muted-foreground)]">
                              <span className="flex items-center gap-1">
                                <FolderTree className="w-4 h-4" />
                                {category.children?.length || 0}
                              </span>
                              <span>·</span>
                              <span>{category.trends?.length || 0} trends</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends */}
            {selectedCategory.trends.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Trends</h3>
                <TrendsGallery trends={selectedCategory.trends} />
              </div>
            )}

            {selectedCategory.children.length === 0 && selectedCategory.trends.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--muted)]/10 mb-4">
                  <FolderTree className="w-8 h-8 text-[color:var(--muted-foreground)]" />
                </div>
                <p className="text-lg text-[color:var(--muted-foreground)]">
                  No content in this category yet
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]/80 mt-1">
                  Add subcategories or trends to get started
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Categories</h2>
              <p className="text-[color:var(--muted-foreground)]">
                Organize your trends into categories and subcategories
              </p>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--muted)]/10 mb-4">
                  <FolderTree className="w-8 h-8 text-[color:var(--muted-foreground)]" />
                </div>
                <p className="text-lg text-[color:var(--muted-foreground)]">No categories yet</p>
                <p className="text-sm text-[color:var(--muted-foreground)]/80 mt-1">
                  Create your first category to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories
                  .filter((c) => !c.parentId)
                  .map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.1 }
                      }}
                      onClick={() => handleCategoryClick(category)}
                      className="group relative cursor-pointer"
                    >
                      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <CategoryActions category={category} />
                      </div>
                      <Card className="h-full border-[color:var(--border)] bg-[color:var(--background)] transition-all duration-300 hover:shadow-lg hover:shadow-[color:var(--primary)]/5">
                        <div className="relative aspect-video">
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt={category.name}
                              fill
                              className="object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[color:var(--muted)] flex items-center justify-center rounded-t-lg">
                              <FolderTree className="w-8 h-8 text-[color:var(--muted-foreground)]" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-1 line-clamp-1">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-[color:var(--muted-foreground)] mb-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-[color:var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <FolderTree className="w-4 h-4" />
                              {category.children?.length || 0}
                            </span>
                            <span>·</span>
                            <span>{category.trends?.length || 0} trends</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to check if a category is a descendant of another category
function isDescendant(category: Category, targetId: string): boolean {
  if (category.children.some(child => child.id === targetId)) return true;
  return category.children.some(child => isDescendant(child, targetId));
} 
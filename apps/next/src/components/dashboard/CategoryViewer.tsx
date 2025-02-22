'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FolderTree, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
import { TrendsGallery } from '@/components/dashboard/TrendsGallery';
import { Button } from '@/components/ui/button';
import type { Trend } from '@/types/dashboard';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  children: Category[];
  trends: Trend[];
}

interface CategoryViewerProps {
  categories: Category[];
}

export function CategoryViewer({ categories: initialCategories }: CategoryViewerProps) {
  const [categories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setBreadcrumbs(prev => [...prev, { id: category.id, name: category.name }]);
  };

  const handleBackClick = () => {
    if (breadcrumbs.length <= 1) {
      setSelectedCategory(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      const parentCategory = findCategoryById(categories, newBreadcrumbs[newBreadcrumbs.length - 1].id);
      setSelectedCategory(parentCategory);
    }
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedCategory(null);
            setBreadcrumbs([]);
          }}
          className="flex items-center gap-2"
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories</span>
        </Button>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-[color:var(--muted-foreground)]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
                setBreadcrumbs(newBreadcrumbs);
                const category = findCategoryById(categories, crumb.id);
                setSelectedCategory(category);
              }}
            >
              {crumb.name}
            </Button>
          </div>
        ))}
      </nav>

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
                <h2 className="text-2xl font-semibold">{selectedCategory.name}</h2>
                {selectedCategory.description && (
                  <p className="text-[color:var(--muted-foreground)] mt-1">{selectedCategory.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Subcategories */}
            {selectedCategory.children.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subcategories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.children.map((subcategory) => (
                    <motion.div
                      key={subcategory.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group cursor-pointer"
                      onClick={() => handleCategoryClick(subcategory)}
                    >
                      <Card className="border-[color:var(--border)] bg-[color:var(--background)] hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium mb-1">{subcategory.name}</h4>
                              {subcategory.description && (
                                <p className="text-sm text-[color:var(--muted-foreground)] line-clamp-2">
                                  {subcategory.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-[color:var(--muted-foreground)] group-hover:text-[color:var(--primary)] transition-colors" />
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-sm text-[color:var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <FolderTree className="w-4 h-4" />
                              {subcategory.children.length}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {subcategory.trends.length}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends */}
            {selectedCategory.trends.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Trends</h3>
                <TrendsGallery trends={selectedCategory.trends.map(trend => ({
                  ...trend,
                  analytics: trend.isRestricted ? [] : trend.analytics
                }))} />
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories
              .filter((category) => !category.parentId)
              .map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className="group cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <Card className="h-full overflow-hidden border-[color:var(--border)] bg-[color:var(--background)] transition-all duration-300 hover:shadow-lg hover:shadow-[color:var(--primary)]/5">
                    <div className="relative aspect-video">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[color:var(--muted)] flex items-center justify-center">
                          <FolderTree className="w-12 h-12 text-[color:var(--muted-foreground)]" />
                        </div>
                      )}
                      <div className="absolute inset-0 " />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                        {category.description && (
                          <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-sm text-[color:var(--muted-foreground)]">
                            <FolderTree className="w-4 h-4" />
                            {category.children.length}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-[color:var(--muted-foreground)]">
                            <TrendingUp className="w-4 h-4" />
                            {category.trends.length}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[color:var(--muted-foreground)] group-hover:text-[color:var(--primary)] transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
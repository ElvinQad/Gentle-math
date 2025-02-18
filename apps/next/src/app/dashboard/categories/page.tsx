import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { TrendsGallery } from '@/components/dashboard/TrendsGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { type Trend } from '@/types/dashboard';
import { type Analytics } from '@/types/admin';
import { type JsonValue } from '@prisma/client/runtime/library';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CategoryWithRelations extends Category {
  trends: Trend[];
  children: CategoryWithRelations[];
}

interface DbAnalytics {
  id: string;
  createdAt: Date;
  trendId: string;
  dates: Date[];
  values: number[];
  ageSegments: JsonValue;
}

interface DbTrend {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrls: string[];
  mainImageIndex: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  analytics: DbAnalytics | null;
}

type DbCategoryWithRelations = Category & {
  trends: Array<DbTrend & { analytics: DbAnalytics | null }>;
  children: DbCategoryWithRelations[];
};

function formatAnalytics(analytics: DbAnalytics | null): Analytics[] {
  if (!analytics) return [];
  return [{
    id: analytics.id,
    dates: analytics.dates.map((date: Date) => date.toISOString()),
    values: analytics.values,
    ageSegments: analytics.ageSegments ? (analytics.ageSegments as Array<{ name: string; value: number }>).map((segment) => ({
      name: segment.name,
      value: segment.value,
    })) : undefined,
  }];
}

function formatTrend(trend: DbTrend & { analytics: DbAnalytics | null }): Trend {
  return {
    id: trend.id,
    title: trend.title,
    description: trend.description,
    type: trend.type,
    imageUrls: trend.imageUrls,
    mainImageIndex: trend.mainImageIndex,
    createdAt: trend.createdAt.toISOString(),
    updatedAt: trend.updatedAt.toISOString(),
    analytics: formatAnalytics(trend.analytics),
  };
}

function formatCategory(category: DbCategoryWithRelations): CategoryWithRelations {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    trends: category.trends.map(formatTrend),
    children: category.children.map(formatCategory),
  };
}

async function getCategories(): Promise<CategoryWithRelations[]> {
  const categories = await prisma.category.findMany({
    include: {
      trends: {
        include: {
          analytics: true,
        },
      },
      children: {
        include: {
          trends: {
            include: {
              analytics: true,
            },
          },
          children: {
            include: {
              trends: {
                include: {
                  analytics: true,
                },
              },
            },
          },
        },
      },
    },
  }) as DbCategoryWithRelations[];

  return categories.map(formatCategory);
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">Browse trends by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No categories available yet</p>
        </div>
      ) : (
        categories
          .filter((category) => !category.parentId)
          .map((category: CategoryWithRelations) => (
            <section key={category.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  {category.description && (
                    <p className="text-muted-foreground">{category.description}</p>
                  )}
                </div>
              </div>

              <Suspense
                fallback={
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[4/3]" />
                    ))}
                  </div>
                }
              >
                <TrendsGallery trends={category.trends} />
              </Suspense>

              {category.children.map((subcategory: CategoryWithRelations) => (
                <section key={subcategory.id} className="pl-6 border-l space-y-6">
                  <div>
                    <h3 className="text-xl font-medium">{subcategory.name}</h3>
                    {subcategory.description && (
                      <p className="text-muted-foreground">{subcategory.description}</p>
                    )}
                  </div>

                  <Suspense
                    fallback={
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="aspect-[4/3]" />
                        ))}
                      </div>
                    }
                  >
                    <TrendsGallery trends={subcategory.trends} />
                  </Suspense>
                </section>
              ))}
            </section>
          ))
      )}
    </div>
  );
} 
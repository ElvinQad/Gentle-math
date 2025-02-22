import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
// import { TrendsGallery } from '@/components/dashboard/TrendsGallery';
// import { Skeleton } from '@/components/ui/skeleton';
import { type Trend } from '@/types/trends';
import { CategoryViewer } from '@/components/dashboard/CategoryViewer';
import { isSubscriptionValid } from '@/lib/subscription';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CategoryWithRelations extends Category {
  trends: Trend[];
  children: CategoryWithRelations[];
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
  analytics: {
    id: string;
    dates: Date[];
    values: number[];
    ageSegments: Array<{
      name: string;
      value: number;
    }> | null;
  } | null;
}

type DbCategoryWithRelations = Category & {
  trends: DbTrend[];
  children: DbCategoryWithRelations[];
};

function formatTrend(trend: DbTrend, isSubscribed: boolean): Trend {
  return {
    id: trend.id,
    title: trend.title,
    description: trend.description,
    type: trend.type,
    imageUrls: trend.imageUrls,
    mainImageIndex: trend.mainImageIndex,
    createdAt: trend.createdAt.toISOString(),
    updatedAt: trend.updatedAt.toISOString(),
    categoryId: trend.categoryId,
    isRestricted: !isSubscribed,
    analytics: isSubscribed && trend.analytics ? [{
      id: trend.analytics.id,
      dates: trend.analytics.dates.map(d => d.toISOString()),
      values: trend.analytics.values,
      ageSegments: trend.analytics.ageSegments || undefined
    }] : undefined,
  };
}

function formatCategory(category: DbCategoryWithRelations, isSubscribed: boolean): CategoryWithRelations {
  return {
    ...category,
    trends: category.trends.map(trend => formatTrend(trend, isSubscribed)),
    children: category.children.map(child => formatCategory(child, isSubscribed)),
  };
}

async function getCategories(): Promise<CategoryWithRelations[]> {
  const session = await getServerSession(authConfig);
  const isSubscribed = isSubscriptionValid(session?.user?.subscribedUntil);

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

  return categories.map(category => formatCategory(category, isSubscribed));
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-fade-in">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 bg-[color:var(--muted)] rounded-md animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video bg-[color:var(--muted)] rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-[color:var(--muted)] rounded-md animate-pulse" />
                  <div className="h-4 w-1/2 bg-[color:var(--muted)] rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CategoryViewer categories={categories} />
      </Suspense>
    </div>
  );
} 
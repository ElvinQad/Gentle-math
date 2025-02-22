import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// Helper function to safely log errors
function safeLog(message: string, error: unknown) {
  if (error instanceof Error) {
    console.error(message, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(message, String(error));
  }
}

// Validation schemas
const AnalyticsSchema = z.object({
  dates: z.array(z.string()),
  values: z.array(z.number()),
  ageSegments: z.union([
    z.record(z.string(), z.number()),
    z.array(z.object({
      name: z.string(),
      value: z.number()
    }))
  ])
});

const CategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  parentSlug: z.string().optional()
});

const TrendSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  imageUrls: z.array(z.string().url()),
  mainImageIndex: z.number().min(0),
  categorySlug: z.string(),
  analytics: AnalyticsSchema
});

const ColorSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  imageUrl: z.string().url(),
  popularity: z.number().min(0).max(100),
  palette1: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  palette2: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  palette3: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  palette4: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  palette5: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

const BulkImportSchema = z.object({
  categories: z.array(CategorySchema),
  trends: z.array(TrendSchema),
  colors: z.array(ColorSchema)
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting bulk import process...');

    // Check authentication
    const session = await getServerSession(authConfig);
    console.log('Auth session:', { 
      hasUser: !!session?.user, 
      isAdmin: session?.user?.isAdmin 
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized",
        stats: null
      }, { status: 401 });
    }

    // Validate request has a body
    if (!request.body) {
      console.log('Request body is missing');
      return NextResponse.json({
        success: false,
        error: "Request body is missing",
        stats: null
      }, { status: 400 });
    }

    let payload;
    try {
      const text = await request.text();
      console.log('Raw request body:', text);
      payload = JSON.parse(text);
    } catch (e) {
      safeLog('JSON parse error:', e);
      return NextResponse.json({
        success: false,
        error: "Invalid JSON in request body",
        stats: null
      }, { status: 400 });
    }

    if (!payload || typeof payload !== 'object') {
      console.log('Invalid payload type:', typeof payload);
      return NextResponse.json({
        success: false,
        error: "Request body must be a valid JSON object",
        stats: null
      }, { status: 400 });
    }

    // Validate the payload structure
    console.log('Validating payload structure...');
    const validationResult = BulkImportSchema.safeParse(payload);
    if (!validationResult.success) {
      safeLog('Validation errors:', validationResult.error);
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.issues,
        stats: null
      }, { status: 400 });
    }

    const { categories, trends, colors } = validationResult.data;
    console.log('Validated data counts:', {
      categories: categories.length,
      trends: trends.length,
      colors: colors.length
    });

    // Process each type of data in separate transactions
    const stats = {
      categories: 0,
      trends: 0,
      colors: 0
    };

    // Import categories
    if (categories.length > 0) {
      console.log('Starting categories import...');
      try {
        const categoryResult = await prisma.$transaction(async (tx) => {
          const categoryMap = new Map<string, string>();
          const importedCategories = await Promise.all(
            categories.map(async (category) => {
              try {
                let parentId = null;
                if (category.parentSlug) {
                  const parent = await tx.category.findUnique({
                    where: { slug: category.parentSlug },
                    select: { id: true }
                  });
                  if (parent) {
                    parentId = parent.id;
                  }
                }

                const result = await tx.category.upsert({
                  where: { slug: category.slug },
                  update: {
                    name: category.name,
                    description: category.description,
                    imageUrl: category.imageUrl,
                    parentId
                  },
                  create: {
                    slug: category.slug,
                    name: category.name,
                    description: category.description,
                    imageUrl: category.imageUrl,
                    parentId
                  }
                });
                categoryMap.set(category.slug, result.id);
                return result;
              } catch (e) {
                safeLog(`Error importing category ${category.slug}:`, e);
                throw new Error(`Failed to import category ${category.slug}: ${e instanceof Error ? e.message : String(e)}`);
              }
            })
          );
          return { importedCategories, categoryMap };
        }, { timeout: 10000 });
        stats.categories = categoryResult.importedCategories.length;
        console.log('Categories imported:', stats.categories);

        // Import trends in batches with separate transactions
        if (trends.length > 0) {
          console.log('Starting trends import...');
          const batchSize = 5;
          const trendBatches = [];
          for (let i = 0; i < trends.length; i += batchSize) {
            const batch = trends.slice(i, i + batchSize);
            trendBatches.push(batch);
          }

          for (const batch of trendBatches) {
            const batchResults = await prisma.$transaction(async (tx) => {
              return Promise.all(
                batch.map(async (trend) => {
                  try {
                    const categoryId = categoryResult.categoryMap.get(trend.categorySlug);
                    if (!categoryId) {
                      throw new Error(`Category with slug ${trend.categorySlug} not found`);
                    }

                    const existingTrend = await tx.trend.findFirst({
                      where: {
                        title: trend.title,
                        categoryId
                      }
                    });

                    const createdTrend = await tx.trend.upsert({
                      where: {
                        id: existingTrend?.id ?? ''
                      },
                      update: {
                        description: trend.description,
                        type: trend.type,
                        imageUrls: trend.imageUrls,
                        mainImageIndex: trend.mainImageIndex,
                        categoryId
                      },
                      create: {
                        title: trend.title,
                        description: trend.description,
                        type: trend.type,
                        imageUrls: trend.imageUrls,
                        mainImageIndex: trend.mainImageIndex,
                        categoryId
                      }
                    });

                    if (trend.analytics) {
                      await tx.analytics.upsert({
                        where: { trendId: createdTrend.id },
                        update: {
                          dates: trend.analytics.dates.map(date => new Date(date)),
                          values: trend.analytics.values,
                          ageSegments: trend.analytics.ageSegments ? trend.analytics.ageSegments : undefined
                        },
                        create: {
                          trendId: createdTrend.id,
                          dates: trend.analytics.dates.map(date => new Date(date)),
                          values: trend.analytics.values,
                          ageSegments: trend.analytics.ageSegments ? trend.analytics.ageSegments : undefined
                        }
                      });
                    }

                    return createdTrend;
                  } catch (e) {
                    safeLog(`Error importing trend ${trend.title}:`, e);
                    throw new Error(`Failed to import trend ${trend.title}: ${e instanceof Error ? e.message : String(e)}`);
                  }
                })
              );
            }, { timeout: 10000 });
            stats.trends += batchResults.length;
          }
          console.log('Trends imported:', stats.trends);
        }

        // Import colors in batches with separate transactions
        if (colors.length > 0) {
          console.log('Starting colors import...');
          const batchSize = 3;
          const colorBatches = [];
          for (let i = 0; i < colors.length; i += batchSize) {
            const batch = colors.slice(i, i + batchSize);
            colorBatches.push(batch);
          }

          for (const batch of colorBatches) {
            const batchResults = await prisma.$transaction(async (tx) => {
              return Promise.all(
                batch.map(async (color) => {
                  try {
                    const existingColor = await tx.colorTrend.findFirst({
                      where: { name: color.name }
                    });

                    const createdColor = await tx.colorTrend.upsert({
                      where: {
                        id: existingColor?.id ?? ''
                      },
                      update: {
                        hex: color.hex,
                        imageUrl: color.imageUrl,
                        popularity: color.popularity,
                        palette1: color.palette1 || null,
                        palette2: color.palette2 || null,
                        palette3: color.palette3 || null,
                        palette4: color.palette4 || null,
                        palette5: color.palette5 || null
                      },
                      create: {
                        name: color.name,
                        hex: color.hex,
                        imageUrl: color.imageUrl,
                        popularity: color.popularity,
                        palette1: color.palette1 || null,
                        palette2: color.palette2 || null,
                        palette3: color.palette3 || null,
                        palette4: color.palette4 || null,
                        palette5: color.palette5 || null
                      }
                    });

                    return createdColor;
                  } catch (e) {
                    safeLog(`Error importing color ${color.name}:`, e);
                    throw new Error(`Failed to import color ${color.name}: ${e instanceof Error ? e.message : String(e)}`);
                  }
                })
              );
            }, { timeout: 10000 });
            stats.colors += batchResults.length;
          }
          console.log('Colors imported:', stats.colors);
        }

        return NextResponse.json({
          success: true,
          error: null,
          stats
        });
      } catch (error) {
        safeLog("Categories import error:", error);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      error: null,
      stats
    });
  } catch (error) {
    safeLog("Bulk import error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to process bulk import";
    console.log("Sending error response:", errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stats: null
    }, { status: 500 });
  }
}
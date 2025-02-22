import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// Validation schema for cleanup options
const CleanupOptionsSchema = z.object({
  categories: z.object({
    all: z.boolean().optional(),
    slugs: z.array(z.string()).optional(),
    orphaned: z.boolean().optional() // Categories without parent or children
  }).optional(),
  trends: z.object({
    all: z.boolean().optional(),
    titles: z.array(z.string()).optional(),
    orphaned: z.boolean().optional(), // Trends without categories
    olderThan: z.string().optional() // ISO date string
  }).optional(),
  colors: z.object({
    all: z.boolean().optional(),
    names: z.array(z.string()).optional(),
    unused: z.boolean().optional() // Colors not associated with any trends
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized",
        stats: null
      }, { status: 401 });
    }

    // Parse and validate request body
    const payload = await request.json();
    const validationResult = CleanupOptionsSchema.safeParse(payload);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid cleanup options",
        details: validationResult.error.issues,
        stats: null
      }, { status: 400 });
    }

    const options = validationResult.data;
    const stats = {
      categories: 0,
      trends: 0,
      colors: 0
    };

    // Perform cleanup operations in a transaction
    await prisma.$transaction(async (tx) => {
      // Clean up categories first (since trends depend on them)
      if (options.categories) {
        if (options.categories.all) {
          // When deleting all categories, also delete orphaned trends
          const result = await tx.category.deleteMany({});
          stats.categories += result.count;
        } else {
          if (options.categories.slugs?.length) {
            const result = await tx.category.deleteMany({
              where: {
                slug: { in: options.categories.slugs }
              }
            });
            stats.categories += result.count;
          }

          if (options.categories.orphaned) {
            const orphanedCategories = await tx.category.findMany({
              where: {
                AND: [
                  { parentId: null },
                  { children: { none: {} } },
                  { trends: { none: {} } } // Also check if no trends are using this category
                ]
              }
            });
            if (orphanedCategories.length > 0) {
              const result = await tx.category.deleteMany({
                where: {
                  id: { in: orphanedCategories.map(c => c.id) }
                }
              });
              stats.categories += result.count;
            }
          }
        }
      }

      // Clean up trends
      if (options.trends) {
        if (options.trends.all) {
          // Delete all trends and their analytics will be cascaded
          const result = await tx.trend.deleteMany({});
          stats.trends += result.count;
        } else {
          const trendsToDelete = new Set<string>();

          if (options.trends.titles?.length) {
            const trendsByTitle = await tx.trend.findMany({
              where: {
                title: { in: options.trends.titles }
              },
              select: { id: true }
            });
            trendsByTitle.forEach(t => trendsToDelete.add(t.id));
          }

          if (options.trends.orphaned) {
            const orphanedTrends = await tx.trend.findMany({
              where: {
                OR: [
                  { categoryId: null },
                  { category: null }
                ]
              },
              select: { id: true }
            });
            orphanedTrends.forEach(t => trendsToDelete.add(t.id));
          }

          if (options.trends.olderThan) {
            const date = new Date(options.trends.olderThan);
            const oldTrends = await tx.trend.findMany({
              where: {
                createdAt: { lt: date }
              },
              select: { id: true }
            });
            oldTrends.forEach(t => trendsToDelete.add(t.id));
          }

          if (trendsToDelete.size > 0) {
            const result = await tx.trend.deleteMany({
              where: {
                id: { in: Array.from(trendsToDelete) }
              }
            });
            stats.trends += result.count;
          }
        }
      }

      // Clean up colors
      if (options.colors) {
        if (options.colors.all) {
          // Delete all colors and their analytics will be cascaded
          const result = await tx.colorTrend.deleteMany({});
          stats.colors += result.count;
        } else {
          const colorsToDelete = new Set<string>();

          if (options.colors.names?.length) {
            const colorsByName = await tx.colorTrend.findMany({
              where: {
                name: { in: options.colors.names }
              },
              select: { id: true }
            });
            colorsByName.forEach(c => colorsToDelete.add(c.id));
          }

          if (options.colors.unused) {
            // Find colors that have no analytics data
            const unusedColors = await tx.colorTrend.findMany({
              where: {
                analytics: null
              },
              select: { id: true }
            });
            unusedColors.forEach(c => colorsToDelete.add(c.id));
          }

          if (colorsToDelete.size > 0) {
            const result = await tx.colorTrend.deleteMany({
              where: {
                id: { in: Array.from(colorsToDelete) }
              }
            });
            stats.colors += result.count;
          }
        }
      }
    }, {
      timeout: 10000 // Set a reasonable timeout for the transaction
    });

    return NextResponse.json({
      success: true,
      error: null,
      stats
    });
  } catch (error) {
    console.error("Bulk cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to clean up data";
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stats: null
    }, { status: 500 });
  }
} 
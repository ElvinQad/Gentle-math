import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized",
        data: null
      }, { status: 401 });
    }

    // Fetch all data in parallel
    const [categories, trends, colors] = await Promise.all([
      // Get categories with their relationships
      prisma.category.findMany({
        select: {
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          parent: {
            select: {
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Get trends with their relationships
      prisma.trend.findMany({
        select: {
          title: true,
          description: true,
          type: true,
          imageUrls: true,
          mainImageIndex: true,
          category: {
            select: {
              slug: true
            }
          },
          analytics: {
            select: {
              dates: true,
              values: true,
              ageSegments: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Get colors
      prisma.colorTrend.findMany({
        select: {
          name: true,
          hex: true,
          imageUrl: true,
          popularity: true,
          palette1: true,
          palette2: true,
          palette3: true,
          palette4: true,
          palette5: true,
          analytics: {
            select: {
              dates: true,
              values: true,
              ageSegments: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // Transform the data to match the import format
    const formattedData = {
      categories: categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        imageUrl: cat.imageUrl || '',
        parentSlug: cat.parent?.slug
      })),
      trends: trends.map(trend => ({
        title: trend.title,
        description: trend.description,
        type: trend.type,
        imageUrls: trend.imageUrls,
        mainImageIndex: trend.mainImageIndex,
        categorySlug: trend.category?.slug || '',
        analytics: trend.analytics ? {
          dates: trend.analytics.dates.map(date => date.toISOString().split('T')[0]),
          values: trend.analytics.values,
          ageSegments: trend.analytics.ageSegments || []
        } : null
      })),
      colors: colors.map(color => ({
        name: color.name,
        hex: color.hex,
        imageUrl: color.imageUrl,
        popularity: color.popularity,
        palette1: color.palette1,
        palette2: color.palette2,
        palette3: color.palette3,
        palette4: color.palette4,
        palette5: color.palette5,
        analytics: color.analytics ? {
          dates: color.analytics.dates.map(date => date.toISOString().split('T')[0]),
          values: color.analytics.values,
          ageSegments: color.analytics.ageSegments || []
        } : null
      }))
    };

    // Return the formatted data
    return NextResponse.json({
      success: true,
      error: null,
      data: formattedData,
      stats: {
        categories: categories.length,
        trends: trends.length,
        colors: colors.length
      }
    });
  } catch (error) {
    console.error("Bulk export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to export data";
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null,
      stats: null
    }, { status: 500 });
  }
} 
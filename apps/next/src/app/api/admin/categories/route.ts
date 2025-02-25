import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { isUserAdmin } from '@/lib/user-helpers';
import { prisma } from '@/lib/db';

// Recursive type for category selection
const getFullCategorySelect = () => ({
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  parentId: true,
  children: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          parentId: true,
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              imageUrl: true,
              parentId: true,
              children: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  imageUrl: true,
                  parentId: true,
                }
              },
              trends: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  imageUrls: true,
                  mainImageIndex: true,
                  createdAt: true,
                  updatedAt: true,
                  analytics: {
                    select: {
                      dates: true,
                      values: true,
                      ageSegments: true,
                    },
                  },
                },
              },
            }
          },
          trends: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              imageUrls: true,
              mainImageIndex: true,
              createdAt: true,
              updatedAt: true,
              analytics: {
                select: {
                  dates: true,
                  values: true,
                  ageSegments: true,
                },
              },
            },
          },
        }
      },
      trends: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          imageUrls: true,
          mainImageIndex: true,
          createdAt: true,
          updatedAt: true,
          analytics: {
            select: {
              dates: true,
              values: true,
              ageSegments: true,
            },
          },
        },
      },
    },
  },
  trends: {
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      imageUrls: true,
      mainImageIndex: true,
      createdAt: true,
      updatedAt: true,
      analytics: {
        select: {
          dates: true,
          values: true,
          ageSegments: true,
        },
      },
    },
  },
});

// GET /api/admin/categories - Get all categories
export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user || !isUserAdmin(session.user)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    // Get root categories with full nested structure
    const categories = await prisma.category.findMany({
      where: {
        parentId: null // Only get root categories
      },
      select: getFullCategorySelect(),
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper function to check for circular references
async function wouldCreateCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
  let currentId = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) return true;
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    const parent = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true }
    });

    if (!parent) break;
    currentId = parent.parentId || '';
  }

  return false;
}

// POST /api/admin/categories - Create a new category
export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || !isUserAdmin(session.user)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    const { name, slug, description, imageUrl, parentId } = await req.json();

    // Check if slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return new NextResponse('Category with this slug already exists', { status: 400 });
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return new NextResponse('Parent category not found', { status: 400 });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
      },
      select: getFullCategorySelect(),
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/admin/categories - Update an existing category
export async function PUT(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || !isUserAdmin(session.user)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    const { id, name, slug, description, imageUrl, parentId } = await req.json();

    // Check if slug is unique (excluding the current category)
    const existingCategory = await prisma.category.findFirst({
      where: { 
        slug,
        NOT: { id }
      },
    });

    if (existingCategory) {
      return new NextResponse('Category with this slug already exists', { status: 400 });
    }

    // If parentId is provided, verify it exists and wouldn't create a circular reference
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return new NextResponse('Parent category not found', { status: 400 });
      }

      // Check for circular reference
      if (await wouldCreateCircularReference(id, parentId)) {
        return new NextResponse('Cannot create circular reference in category hierarchy', { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
      },
      select: getFullCategorySelect(),
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/admin/categories/:id - Delete a category
export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user || !isUserAdmin(session.user)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        trends: true,
      },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    if (category.children.length > 0) {
      return new NextResponse('Cannot delete category with subcategories', { status: 400 });
    }

    if (category.trends.length > 0) {
      return new NextResponse('Cannot delete category with trends', { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
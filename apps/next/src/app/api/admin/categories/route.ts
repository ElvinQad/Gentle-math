import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { isUserAdmin } from '@/lib/user-helpers';
import { prisma } from '@/lib/db';

// GET /api/admin/categories - Get all categories
export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user || !isUserAdmin(session.user)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    // First get root categories
    const categories = await prisma.category.findMany({
      where: {
        parentId: null // Only get root categories
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            children: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
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
      },
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

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
      },
      include: {
        children: true,
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
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/admin/categories/:id - Update an existing category
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

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
      },
      include: {
        children: true,
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
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
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
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        trends: {
          select: {
            id: true,
            title: true,
          },
        },
      },
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
    const { name, slug, description, parentId } = await req.json();

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
        parentId: parentId || null,
      },
      include: {
        children: true,
        trends: {
          select: {
            id: true,
            title: true,
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
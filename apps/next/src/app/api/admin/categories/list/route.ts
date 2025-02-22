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
                imageUrl: true
              }
            }
          }
        }
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
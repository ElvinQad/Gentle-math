import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';

async function isAdminUser(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true },
  });

  return user?.isAdmin === true;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const session = await getServerSession(authConfig);

    // Check authentication
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt to admin API');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const isAdmin = await isAdminUser(session.user.email);
    if (!isAdmin) {
      console.log('Non-admin user attempted to clear activities:', session.user.email);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all activities for the user
    await prisma.userActivity.deleteMany({
      where: { userId: params.userId },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Activity clear error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

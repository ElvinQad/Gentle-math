import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // If user has no password (Google auth), allow setting a new one without current password
    if (!user.password) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword },
      });
      return new NextResponse('Password set successfully');
    }

    // For users with existing password, verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return new NextResponse('Invalid current password', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return new NextResponse('Password updated successfully');
  } catch (error) {
    console.error('Password update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    console.log('Password update request received');
    
    const session = await getServerSession(authConfig);
    console.log('Session:', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      email: session?.user?.email 
    });
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body received:', { 
      hasCurrentPassword: !!body.currentPassword,
      hasNewPassword: !!body.newPassword 
    });
    
    const { currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    console.log('User lookup result:', { 
      found: !!user,
      hasExistingPassword: !!user?.password 
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has no password (Google auth), allow setting a new one without current password
    if (!user.password) {
      console.log('Setting initial password for Google auth user');
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword },
      });
      return NextResponse.json({ message: 'Password set successfully' });
    }

    // For users with existing password, verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    console.log('Password validation:', { isValid });
    
    if (!isValid) {
      console.log('Invalid current password');
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    console.log('Password updated successfully');
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

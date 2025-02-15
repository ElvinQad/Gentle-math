import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ hasAccess: false, reason: 'No session' });
    }

    // Check if user has valid sheets token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        sheetsAccessToken: true,
        sheetsTokenExpiry: true,
      },
    });

    const hasValidToken = !!(
      user?.sheetsAccessToken && 
      user?.sheetsTokenExpiry && 
      new Date(user.sheetsTokenExpiry) > new Date()
    );

    return NextResponse.json({ 
      hasAccess: hasValidToken,
      expiresAt: user?.sheetsTokenExpiry || null,
    });
  } catch (error) {
    // Safe error logging without circular references
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error,
      code: (error as any)?.code,
    };
    
    console.error('Failed to check sheets status:', errorDetails);
    
    return NextResponse.json({ 
      hasAccess: false, 
      error: errorDetails.message 
    });
  }
} 
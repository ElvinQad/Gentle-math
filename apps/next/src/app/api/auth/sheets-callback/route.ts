import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.isAdmin) {
      const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // First check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email as string,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      console.error('User not found:', { email: session.user.email });
      const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
      redirectUrl.searchParams.set('error', 'user_not_found');
      return NextResponse.redirect(redirectUrl.toString());
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || state !== 'sheets-access') {
      const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
      redirectUrl.searchParams.set('error', 'invalid_request');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/sheets-callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        error: tokens.error,
        error_description: tokens.error_description
      });
      
      const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
      redirectUrl.searchParams.set('error', 'token_exchange_failed');
      redirectUrl.searchParams.set('details', tokens.error_description || tokens.error);
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Store the sheets access token for the user using the database ID
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          sheetsAccessToken: tokens.access_token,
          sheetsRefreshToken: tokens.refresh_token,
          sheetsTokenExpiry: new Date(Date.now() + (tokens.expires_in * 1000)),
        },
      });
    } catch (updateError) {
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      console.error('Failed to update user with sheets tokens:', {
        userId: user.id,
        message: errorMessage,
      });
      
      const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
      redirectUrl.searchParams.set('error', 'token_storage_failed');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Redirect back to the dashboard with success message
    const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set('sheets', 'connected');
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    // Safe error logging without circular references
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sheets callback error:', { message: errorMessage });
    
    // Redirect with error
    const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set('error', 'internal_error');
    return NextResponse.redirect(redirectUrl.toString());
  }
} 
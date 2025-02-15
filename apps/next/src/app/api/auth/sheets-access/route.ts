import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Construct Google OAuth URL for sheets access
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/sheets-callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      access_type: 'offline',
      prompt: 'consent',
      state: 'sheets-access', // To identify this specific flow
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Sheets access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
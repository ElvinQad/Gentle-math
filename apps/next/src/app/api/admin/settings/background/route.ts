import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { imageUrl } = await request.json();

    // Update or create the background image setting
    const setting = await prisma.setting.upsert({
      where: { key: 'landing_background_image' },
      update: { value: imageUrl },
      create: {
        key: 'landing_background_image',
        value: imageUrl,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Background image update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'landing_background_image' },
    });

    return NextResponse.json({ imageUrl: setting?.value ?? '/bg.avif' });
  } catch (error) {
    console.error('Background image fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
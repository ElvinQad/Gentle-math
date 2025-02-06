import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'

export async function DELETE() {
  try {
    const session = await getServerSession(authConfig)
    const userEmail = session?.user?.email

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adapter = authConfig.adapter;
    if (!adapter) {
      return NextResponse.json({ error: 'Auth adapter not configured' }, { status: 500 });
    }

    const { getUserByEmail, deleteUser } = adapter;
    if (!getUserByEmail || !deleteUser) {
      return NextResponse.json({ error: 'Adapter functions not implemented' }, { status: 500 });
    }

    // Find user by email using auth adapter
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete the user using auth adapter
    await deleteUser(user.id);

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log the error safely
    if (error instanceof Error) {
      console.error('Delete user error:', error.message)
    } else {
      console.error('Delete user error:', String(error))
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean
  }
}

// Combine both middleware functions into one
export default withAuth(
  async function middleware(req) {
    // Track user activity
    const token = req.nextauth.token
    if (token?.sub) {
      // Track user activity via API route instead of direct Prisma call
      fetch(`${req.nextUrl.origin}/api/user/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: token.sub,
          type: 'page_view',
          metadata: {
            path: req.nextUrl.pathname,
            userAgent: req.headers.get('user-agent'),
            forwardedFor: req.headers.get('x-forwarded-for'),
          },
        }),
      }).catch(error => console.error('Failed to track user activity:', error))
    }

    // Ensure admin routes are protected
    const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin')
    if (isAdminRoute) {
      // Strict check for admin status
      if (token?.isAdmin !== true) {
        console.log('Non-admin user attempted to access admin route:', token?.email)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
} 
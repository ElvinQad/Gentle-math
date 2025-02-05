import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean
  }
}

// In-memory storage for throttling (consider using Redis in production)
const activityCache = new Map<string, number>()
const THROTTLE_DURATION = 60 * 1000 // 1 minute in milliseconds
const SESSION_EVENTS = {
  LOGIN: 'session.login',
  LOGOUT: 'session.logout',
  EXPIRED: 'session.expired',
  REFRESH: 'session.refresh'
} as const

// Skip activity tracking for internal requests to prevent loops
const IGNORED_PATHS = [
  '/api/',
  '/_next/',
  '/static/',
  '/favicon.ico',
  '/manifest.json'
]

function shouldTrackPath(path: string): boolean {
  return !IGNORED_PATHS.some(ignoredPath => path.startsWith(ignoredPath))
}

function shouldThrottle(userId: string): boolean {
  const lastActivity = activityCache.get(userId)
  const now = Date.now()
  
  if (!lastActivity || (now - lastActivity) > THROTTLE_DURATION) {
    activityCache.set(userId, now)
    return false
  }
  
  return true
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [userId, timestamp] of activityCache.entries()) {
    if (now - timestamp > THROTTLE_DURATION) {
      activityCache.delete(userId)
    }
  }
}, THROTTLE_DURATION)

async function trackActivity(req: NextRequest, token: any, type: string, additionalMetadata = {}) {
  try {
    const path = req.nextUrl.pathname
    // Skip tracking for paths we want to ignore
    if (!shouldTrackPath(path)) {
      return
    }

    const response = await fetch(`${req.nextUrl.origin}/api/user/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-request': '1',
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        type,
        metadata: {
          path: path === '/' ? 'home' : path.replace(/^\/+|\/+$/g, ''),
          userAgent: req.headers.get('user-agent')?.split(' ')[0] || 'unknown',
          sessionId: token.jti,
          ...additionalMetadata
        },
      }),
    })

    if (!response.ok) {
      console.error('Failed to track activity:', await response.text())
    }
  } catch (error) {
    console.error('Error tracking activity:', error)
  }
}

export default withAuth(
  async function middleware(req) {
    const isInternalRequest = req.headers.get('x-internal-request') === '1'
    const isActivityEndpoint = req.nextUrl.pathname === '/api/user/activity'
    
    if (isInternalRequest || isActivityEndpoint) {
      return NextResponse.next()
    }

    const token = req.nextauth.token
    if (token?.sub && !IGNORED_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
      // Track page view
      await trackActivity(req, token, 'page_view')

      // Track session refresh if token was recently issued
      const tokenIssuedAt = token.iat ? new Date((token.iat as number) * 1000) : null
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      if (tokenIssuedAt && tokenIssuedAt > fiveMinutesAgo) {
        await trackActivity(req, token, SESSION_EVENTS.REFRESH)
      }
    }

    // Ensure admin routes are protected
    const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin')
    if (isAdminRoute && token?.isAdmin !== true) {
      console.log('Non-admin user attempted to access admin route:', token?.email)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Configure middleware paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!api/user/activity).*)',
  ],
} 
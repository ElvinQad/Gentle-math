import { withAuth } from 'next-auth/middleware'

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean
    jti?: string
  }
}


export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      console.log('Middleware: Auth check', {
        path: req.nextUrl.pathname,
        hasToken: !!token
      })
      return !!token
    },
  },
})

// Configure middleware paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!api/user/activity).*)',
  ],
} 
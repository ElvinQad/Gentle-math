import { withAuth } from 'next-auth/middleware';

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
    jti?: string;
  }
}

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      console.log('Middleware: Auth check', {
        path: req.nextUrl.pathname,
        hasToken: !!token,
        isAdmin: token?.isAdmin,
      });

      // Protect admin routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.isAdmin === true;
      }

      // Regular auth check for other routes
      return !!token;
    },
  },
});

// Configure middleware paths to only protect specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/trends/:path*',
  ],
};

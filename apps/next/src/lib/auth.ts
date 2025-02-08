import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db'
import { compare, hash } from 'bcryptjs'

// Add this type definition at the top of the file, after the imports
type SessionEventMetadata = {
  provider?: string;
  timestamp?: string;
  [key: string]: string | undefined;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
      subscribedUntil?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    isAdmin?: boolean
    subscribedUntil?: string | null
  }
}

async function trackSessionEvent(
  userId: string, 
  type: string, 
  metadata: SessionEventMetadata = {}
) {
  try {
    // Ensure metadata is serializable
    const safeMetadata = JSON.parse(JSON.stringify(metadata || {}))
    
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        metadata: safeMetadata,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    // Log the error but don't throw
    console.error('Failed to track session event:', {
      userId,
      type,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'my-default-secret',
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { 
            id: true, 
            email: true, 
            name: true, 
            password: true,
            isAdmin: true,
            subscribedUntil: true,
            emailVerified: true
          }
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.password && user.emailVerified) {
          throw new Error('This email is registered with Google. Please sign in with Google instead.');
        }

        if (!user.password || !await compare(credentials.password, user.password)) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          subscribedUntil: user.subscribedUntil?.toISOString() || null,
        };
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account }) {
      try {
        // Get the user from our database first
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || undefined }
        });

        if (dbUser?.id) {
          await trackSessionEvent(dbUser.id, 'session.login', {
            provider: account?.provider,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Sign in event error:', error)
      }
    },
    async signOut({ token }) {
      try {
        if (token?.id) { // Use token.id instead of token.sub
          await trackSessionEvent(token.id as string, 'session.logout', {
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Sign out event error:', error)
      }
    }
  },
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email || undefined }
        });

        // If user doesn't exist, create one
        if (!existingUser && user.email) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            }
          });
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      try {
        // Only fetch fresh data on sign in or when explicitly requested
        if (user || trigger === 'update') {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email || undefined },
            select: {
              id: true,
              email: true,
              name: true,
              isAdmin: true,
              subscribedUntil: true
            }
          });

          if (dbUser) {
            // Update token with latest user data
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.isAdmin = dbUser.isAdmin || false;
            token.subscribedUntil = dbUser.subscribedUntil?.toISOString() || null;
          } else if (user) {
            // Fallback to user data if database query fails
            token.id = user.id;
            token.email = user.email;
            token.name = user.name;
            token.isAdmin = user.isAdmin || false;
            token.subscribedUntil = user.subscribedUntil || null;
          }
        }
      } catch (error) {
        console.error('Error updating JWT:', error);
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('Auth Config: Session callback', { 
        hasSession: !!session,
        hasToken: !!token,
        tokenData: {
          id: token.id,
          email: token.email
        }
      })
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.subscribedUntil = token.subscribedUntil as string | null
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Strip nested callback URLs
      const cleanUrl = url.split('?')[0]
      
      // If the URL is relative or matches the base URL, return it
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        return cleanUrl
      }
      
      // Default to base URL
      return baseUrl
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  jwt: {
    maxAge: 60 * 60 * 24 // 24 hours
  },
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
} 
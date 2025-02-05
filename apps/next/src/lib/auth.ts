import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db'
import { compare, hash } from 'bcryptjs'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

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
}

async function trackSessionEvent(userId: string, type: string, metadata = {}) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        metadata,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to track session event:', error)
  }
}

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'my-default-secret',
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
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
        console.log('CredentialsProvider authorize called with:', credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password in credentials');
          return null;
        }

        // Normalize email
        const normalizedEmail = credentials.email.trim().toLowerCase();
        console.log('Normalized email:', normalizedEmail);

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { 
            id: true, 
            email: true, 
            name: true, 
            password: true,
            isAdmin: true,
            subscribedUntil: true
          }
        });

        if (!user || !user.password) {
          console.log('User not found or missing password:', user);
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          console.log('Invalid password');
          return null;
        }

        console.log('User authenticated successfully:', user);
        return {
          id: user.id.toString(),
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
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (user.id) {
        await trackSessionEvent(user.id, 'session.login', {
          provider: account?.provider,
          isNewUser,
        })
      }
    },
    async signOut({ token }) {
      if (token?.sub) {
        await trackSessionEvent(token.sub, 'session.logout', {
          sessionId: token.jti,
        })
      }
    },
    async session({ token, session }) {
      if (token?.sub) {
        await trackSessionEvent(token.sub, 'session.refresh', {
          sessionId: token.jti,
        })
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || undefined },
          select: {
            isAdmin: true,
            subscribedUntil: true
          }
        });
        token.isAdmin = dbUser?.isAdmin || false;
        token.subscribedUntil = dbUser?.subscribedUntil?.toISOString() || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.subscribedUntil = token.subscribedUntil as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Get the hostname from the URL
      try {
        const returnUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        // Check if we're dealing with a .ru domain
        const isRuDomain = returnUrl.hostname.endsWith('.ru') || baseUrlObj.hostname.endsWith('.ru');
        
        if (isRuDomain) {
          // Construct the proper .ru URL while maintaining the path and query parameters
          const ruBaseUrl = baseUrl.replace(/\.[^.]+(\:[0-9]+)?$/, '.ru$1');
          return url.replace(baseUrl, ruBaseUrl);
        }
        
        // Default case - return the original URL
        return url;
      } catch (e) {
        // If URL parsing fails, return the original URL
        return url;
      }
    }
  },
  session: {
    strategy: 'jwt',
  },
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
} 
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { OAuthUserConfig } from 'next-auth/providers/oauth';

// Add this type definition at the top of the file, after the imports
type SessionEventMetadata = {
  provider?: string;
  timestamp?: string;
  [key: string]: string | undefined;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      subscribedUntil?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    subscribedUntil?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    isAdmin?: boolean;
    subscribedUntil?: string | null;
    accessToken?: string;
  }
}

async function trackSessionEvent(
  userId: string,
  type: string,
  metadata: SessionEventMetadata = {},
) {
  try {
    // Ensure metadata is serializable
    const safeMetadata = JSON.parse(JSON.stringify(metadata || {}));

    await prisma.userActivity.create({
      data: {
        userId,
        type,
        metadata: safeMetadata,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // Log the error but don't throw
    console.error('Failed to track session event:', {
      userId,
      type,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Function to check if email is admin
function isAdminEmail(email: string): boolean {
  const adminEmails = [
    process.env.ABBASOV,
    process.env.QADIROV,
  ].filter(Boolean).map(email => email?.toLowerCase());
  
  return adminEmails.includes(email.toLowerCase());
}

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - match session maxAge
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    } as OAuthUserConfig<{
      sub: string;
      name: string;
      email: string;
      picture: string;
    }>),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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
            emailVerified: true,
          },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.password && user.emailVerified) {
          throw new Error(
            'This email is registered with Google. Please sign in with Google instead.',
          );
        }

        if (!user.password || !(await compare(credentials.password, user.password))) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          subscribedUntil: user.subscribedUntil?.toISOString() || null,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  events: {
    async signIn({ user, account }) {
      try {
        // Get the user from our database first
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || undefined },
        });

        if (dbUser?.id) {
          await trackSessionEvent(dbUser.id, 'session.login', {
            provider: account?.provider,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Sign in event error:', error);
      }
    },
    async signOut({ token }) {
      try {
        if (token?.id) {
          // Use token.id instead of token.sub
          await trackSessionEvent(token.id as string, 'session.logout', {
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Sign out event error:', error);
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Check if user is admin
          const isAdmin = isAdminEmail(user.email);
          
          // Store admin status in user object
          user.isAdmin = isAdmin;
          
          // For admin users, we'll handle sheets access separately
          // through a dedicated endpoint that will be called after login
          
          return true;
        }
        return true;
      } catch (error) {
        console.error('Sign in callback error:', error);
        return true;
      }
    },
    async jwt({ token, account, user }) {
      try {
        // Handle initial sign in
        if (account && user) {
          return {
            ...token,
            accessToken: account.access_token,
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false,
            subscribedUntil: user.subscribedUntil || null,
          };
        }

        // On subsequent calls, return the token
        return token;
      } catch (error) {
        console.error('Error updating JWT:', error);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.subscribedUntil = token.subscribedUntil as string | null;
      }

      // Add access token to session
      session.accessToken = token.accessToken;

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Strip nested callback URLs
      const cleanUrl = url.split('?')[0];

      // If the URL is relative or matches the base URL, return it
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        return cleanUrl;
      }

      // Default to base URL
      return baseUrl;
    },
  },
};

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}

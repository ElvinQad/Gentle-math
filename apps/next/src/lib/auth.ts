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
    }
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
          select: { id: true, email: true, name: true, password: true }
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
        };
      }
    })
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
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
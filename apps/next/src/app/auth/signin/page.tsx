'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google sign in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--foreground)]">Welcome Back</h2>
          <p className="mt-2 text-center text-sm text-[color:var(--muted-foreground)]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[color:var(--card)] text-[color:var(--card-foreground)] py-2.5 px-4 rounded-lg border hover:bg-[color:var(--accent)]/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[color:var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[color:var(--background)] text-[color:var(--muted-foreground)]">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-[color:var(--destructive)] bg-[color:var(--destructive)]/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[color:var(--foreground)]">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2.5 border rounded-lg bg-[color:var(--background)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--primary)]/50 focus:border-[color:var(--primary)] outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[color:var(--foreground)]">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2.5 border rounded-lg bg-[color:var(--background)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--primary)]/50 focus:border-[color:var(--primary)] outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] py-2.5 rounded-lg font-medium hover:bg-[color:var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-[color:var(--muted-foreground)]">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-[color:var(--primary)] hover:underline font-medium">
                Register
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { signIn } from 'next-auth/react';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export function AuthModals({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactElement>('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onLoginClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();
    const name = (formData.get('name') as string)?.trim();

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        throw new Error(data.error || 'Registration failed');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registration successful but sign in failed. Please try logging in.');
      } else {
        onRegisterClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const callbackUrl = window.location.href || '/dashboard';
      await signIn('google', { callbackUrl });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google sign in failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Define reusable classes for consistent styling
  const formClasses = 'space-y-4 animate-fade-in';

  const inputWrapperClasses = 'space-y-2 group focus-within:space-y-1 transition-all duration-200 ease-out-expo';

  const labelClasses = 'text-sm font-medium text-[color:var(--muted-foreground)] transition-all duration-200 ease-out-expo ' +
    'group-focus-within:text-[color:var(--color-soft-blue)] group-focus-within:text-xs';

  const inputClasses = 'w-full px-4 py-3 rounded-lg transition-all duration-200 ease-out-expo ' +
    'bg-[color:var(--background)] text-[color:var(--foreground)] ' +
    'border border-[color:var(--border)] ' +
    'focus:ring-2 focus:ring-[color:var(--color-soft-blue)]/20 focus:border-[color:var(--color-soft-blue)] ' +
    'placeholder:text-[color:var(--muted-foreground)]/40 ' +
    'hover:border-[color:var(--color-soft-blue)]/50';

  const buttonBaseClasses = 'w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ease-out-expo ' +
    'focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none ' +
    'active:scale-[0.98] hover:-translate-y-0.5';

  const primaryButtonClasses = buttonBaseClasses + ' ' +
    'bg-[color:var(--color-soft-blue)] text-white ' +
    'hover:bg-[color:var(--color-soft-blue)]/90 ' +
    'focus:ring-[color:var(--color-soft-blue)]/50';

  const secondaryButtonClasses = buttonBaseClasses + ' ' +
    'bg-[color:var(--background-secondary)] text-[color:var(--foreground)] ' +
    'border border-[color:var(--border)] ' +
    'hover:bg-[color:var(--background-secondary)]/80 ' +
    'focus:ring-[color:var(--color-soft-blue)]/30';

  const errorClasses = 'p-4 text-sm rounded-lg bg-[color:var(--color-subtle-red)]/10 ' +
    'text-[color:var(--color-subtle-red)] border border-[color:var(--color-subtle-red)]/20 ' +
    'animate-fade-in';

  const dividerClasses = 'relative my-6';
  const dividerLineClasses = 'absolute inset-0 flex items-center';
  const dividerTextClasses = 'relative flex justify-center text-sm font-medium';
  const dividerTextSpanClasses = 'px-2 bg-[color:var(--background)] text-[color:var(--muted-foreground)]';

  const linkButtonClasses = 'text-[color:var(--color-soft-blue)] hover:text-[color:var(--color-soft-blue)]/90 ' +
    'focus:outline-none focus:ring-2 focus:ring-[color:var(--color-soft-blue)]/50 rounded transition-all duration-200 ease-out-expo';

  return (
    <>
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} title="Welcome Back">
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={secondaryButtonClasses + ' flex items-center justify-center gap-3'}
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

          <div className={dividerClasses}>
            <div className={dividerLineClasses}>
              <div className="w-full border-t border-[color:var(--border)]" />
            </div>
            <div className={dividerTextClasses}>
              <span className={dividerTextSpanClasses}>
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className={formClasses}>
            {error && (
              <div className={errorClasses} role="alert">
                {error}
              </div>
            )}
            <div className={inputWrapperClasses}>
              <label htmlFor="email" className={labelClasses}>
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className={inputClasses}
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            <div className={inputWrapperClasses}>
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className={inputClasses}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonClasses}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
            <div className="text-center text-sm text-[color:var(--muted-foreground)]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className={linkButtonClasses}
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} title="Create Account">
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={secondaryButtonClasses + ' flex items-center justify-center gap-3'}
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

          <div className={dividerClasses}>
            <div className={dividerLineClasses}>
              <div className="w-full border-t border-[color:var(--border)]" />
            </div>
            <div className={dividerTextClasses}>
              <span className={dividerTextSpanClasses}>
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleRegister} className={formClasses}>
            {error && (
              <div className={errorClasses} role="alert">
                {error}
              </div>
            )}
            <div className={inputWrapperClasses}>
              <label htmlFor="name" className={labelClasses}>
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className={inputClasses}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            <div className={inputWrapperClasses}>
              <label htmlFor="register-email" className={labelClasses}>
                Email address
              </label>
              <input
                type="email"
                id="register-email"
                name="email"
                required
                className={inputClasses}
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            <div className={inputWrapperClasses}>
              <label htmlFor="register-password" className={labelClasses}>
                Password
              </label>
              <input
                type="password"
                id="register-password"
                name="password"
                required
                className={inputClasses}
                placeholder="Choose a strong password"
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonClasses}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
            <div className="text-center text-sm text-[color:var(--muted-foreground)]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className={linkButtonClasses}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

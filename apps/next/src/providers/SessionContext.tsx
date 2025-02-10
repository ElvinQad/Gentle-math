import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  error: null,
});

const SESSION_CACHE_KEY = 'next-auth.session-cache';
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cachedSession, setCachedSession] = useState<Session | null>(null);

  useEffect(() => {
    // Try to load session from cache on mount
    try {
      const cached = localStorage.getItem(SESSION_CACHE_KEY);
      if (cached) {
        const { session: cachedSessionData, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < SESSION_CACHE_DURATION) {
          setCachedSession(cachedSessionData);
          setLoading(false);
        } else {
          localStorage.removeItem(SESSION_CACHE_KEY);
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load session cache'));
      console.error('Error reading session cache:', err);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    setLoading(false);

    if (session) {
      try {
        localStorage.setItem(
          SESSION_CACHE_KEY,
          JSON.stringify({
            session,
            timestamp: Date.now(),
          }),
        );
        setCachedSession(session);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to cache session'));
        console.error('Error caching session:', err);
      }
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
      setCachedSession(null);
    }
  }, [session, status]);

  const value = {
    session: session || cachedSession,
    loading,
    error,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSessionContext = () => useContext(SessionContext);

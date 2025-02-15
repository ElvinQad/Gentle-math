import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export function RequestSheetsAccess() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have sheets access
  const checkSheetsAccess = async () => {
    try {
      setChecking(true);
      setError(null);
      const response = await fetch('/api/auth/sheets-status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check access status');
      }
      
      setHasAccess(data.hasAccess);
      if (!data.hasAccess && data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error('Failed to check sheets access:', error);
      setHasAccess(false);
      setError(error instanceof Error ? error.message : 'Failed to check access status');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (session?.user?.isAdmin) {
      checkSheetsAccess();
    }
  }, [session]);

  // Handle success/error messages from URL
  useEffect(() => {
    const isConnected = searchParams?.get('sheets') === 'connected';
    const error = searchParams?.get('error');
    const details = searchParams?.get('details');

    if (isConnected) {
      toast.success('Successfully connected to Google Sheets!');
      checkSheetsAccess(); // Refresh the status
    } else if (error) {
      let errorMessage = 'Failed to connect to Google Sheets';
      switch (error) {
        case 'unauthorized':
          errorMessage = 'You are not authorized to access Google Sheets';
          break;
        case 'user_not_found':
          errorMessage = 'User account not found';
          break;
        case 'invalid_request':
          errorMessage = 'Invalid request. Please try again';
          break;
        case 'token_exchange_failed':
          errorMessage = details || 'Failed to get access from Google';
          break;
        case 'token_storage_failed':
          errorMessage = 'Failed to store access tokens';
          break;
        case 'internal_error':
          errorMessage = 'An internal error occurred';
          break;
      }
      toast.error(errorMessage, {
        description: 'Please try connecting again',
      });
    }
  }, [searchParams]);

  const requestAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/sheets-access');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request access');
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Failed to request sheets access:', error);
      setError(error instanceof Error ? error.message : 'Failed to request access');
      toast.error('Failed to connect to Google Sheets', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.isAdmin) return null;

  if (checking) {
    return (
      <Button variant="outline" disabled>
        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
        Checking access...
      </Button>
    );
  }

  if (hasAccess) {
    return (
      <Button variant="outline" className="text-green-500 border-green-500" disabled>
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Connected to Sheets
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="outline"
        className="text-red-500 border-red-500 hover:bg-red-50"
        onClick={requestAccess}
        disabled={loading}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        {loading ? 'Reconnecting...' : 'Reconnect Sheets'}
      </Button>
    );
  }

  return (
    <Button
      onClick={requestAccess}
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <>
          <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Google Sheets'
      )}
    </Button>
  );
} 
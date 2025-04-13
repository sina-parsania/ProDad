'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useDbInitialization } from '@/hooks/useDbInitialization';

interface DbProviderProps {
  children: ReactNode;
}

export function DbProvider({ children }: DbProviderProps) {
  const { isInitialized, error } = useDbInitialization();
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (error) {
      setShowError(true);
      console.error('Database initialization error:', error);
    }
  }, [error]);

  // Prevent hydration mismatch by only rendering the client UI when mounted
  if (!mounted) {
    return <>{children}</>;
  }

  // On first render, show a simple loading state
  // In a real app, you'd want a proper loading UI
  if (!isInitialized && !error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading your data...</p>
        </div>
      </div>
    );
  }

  // If there's a database error, show an error UI
  if (showError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="max-w-md p-6 rounded-lg border bg-card text-card-foreground shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Database Error</h2>
          <p className="mb-4 text-muted-foreground">
            There was a problem initializing the database. This might be because your browser
            doesn&apos;t support IndexedDB or has privacy settings that restrict it.
          </p>
          <div className="flex justify-end">
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

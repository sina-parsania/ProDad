'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db/db';

export function useDbInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip initialization on server-side
    if (typeof window === 'undefined') return;

    const initializeDb = async () => {
      try {
        // Check if database is accessible
        await db.open();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err as Error);
      }
    };

    initializeDb();

    return () => {
      // Close the database connection when component unmounts
      db.close();
    };
  }, []);

  return { isInitialized, error };
}

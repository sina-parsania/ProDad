'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRecentItems } from '@/lib/db/db';
import { CalendarEvent } from '@/types/calendar';
import { Reminder } from '@/types/reminder';
import { Document } from '@/types/document';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{
    events: CalendarEvent[];
    reminders: Reminder[];
    documents: Document[];
  }>({
    events: [],
    reminders: [],
    documents: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getRecentItems();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}

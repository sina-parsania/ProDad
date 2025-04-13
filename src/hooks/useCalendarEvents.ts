'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/db/db';
import { CalendarEvent } from '@/types/calendar';
import { formatISO } from 'date-fns';

export function useCalendarEvents() {
  const events = useLiveQuery(() => db.calendarEvents.toArray());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (events !== undefined) {
      setLoading(false);
    }
  }, [events]);

  const createEvent = useCallback(
    async (newEvent: Omit<CalendarEvent, 'id' | 'synced' | 'createdAt' | 'updatedAt'>) => {
      try {
        const now = new Date();
        const event: Omit<CalendarEvent, 'id'> = {
          ...newEvent,
          synced: false,
          createdAt: now,
          updatedAt: now,
        };

        const id = await addCalendarEvent(event);
        return id;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const updateEvent = useCallback(
    async (
      id: number,
      changes: Partial<Omit<CalendarEvent, 'id' | 'synced' | 'createdAt' | 'updatedAt'>>,
    ) => {
      try {
        const result = await updateCalendarEvent(id, {
          ...changes,
          synced: false,
          updatedAt: new Date(),
        });
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const removeEvent = useCallback(async (id: number) => {
    try {
      await deleteCalendarEvent(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Function to get events for a date range
  const getEventsInRange = useCallback(async (start: Date, end: Date) => {
    try {
      const allEvents = await db.calendarEvents.toArray();
      return allEvents.filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return eventStart >= start && eventEnd <= end;
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Function to export events to iCal format
  const exportToICalendar = useCallback(async () => {
    if (!events) return '';

    let iCalContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ProDad//EN\r\n';

    events.forEach((event) => {
      iCalContent += 'BEGIN:VEVENT\r\n';
      iCalContent += `SUMMARY:${event.title}\r\n`;
      iCalContent += `DTSTART:${formatISO(new Date(event.start), { format: 'basic' }).replace(/[-:]/g, '')}\r\n`;
      iCalContent += `DTEND:${formatISO(new Date(event.end), { format: 'basic' }).replace(/[-:]/g, '')}\r\n`;
      if (event.description) iCalContent += `DESCRIPTION:${event.description}\r\n`;
      if (event.location) iCalContent += `LOCATION:${event.location}\r\n`;
      iCalContent += `UID:${event.id}@prodad\r\n`;
      iCalContent += 'END:VEVENT\r\n';
    });

    iCalContent += 'END:VCALENDAR';
    return iCalContent;
  }, [events]);

  return {
    events: events || [],
    loading,
    error,
    createEvent,
    updateEvent,
    removeEvent,
    getEventsInRange,
    exportToICalendar,
  };
}

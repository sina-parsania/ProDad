'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useEffect, useState } from 'react';

interface EventsWidgetProps {
  maxItems?: number;
  className?: string;
}

export default function EventsWidget({ maxItems = 5, className = '' }: EventsWidgetProps) {
  const { events, loading } = useCalendarEvents();
  const [mounted, setMounted] = useState(false);
  const [displayEvents, setDisplayEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (events) {
      // Sort events by start date and take only upcoming events
      const now = new Date();
      const upcomingEvents = events
        .filter((event) => new Date(event.start) >= now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, maxItems);

      setDisplayEvents(upcomingEvents);
    }
  }, [events, maxItems]);

  const handleAddEvent = () => {
    // Navigate to the calendar page with the "add" mode
    window.location.href = '/calendar?action=add';
  };

  // Loading skeletons
  const renderLoadingState = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-start pb-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p>No upcoming events found</p>
      <Button variant="link" className="mt-2" onClick={handleAddEvent}>
        Add your first event
      </Button>
    </div>
  );

  // Event items
  const renderEvents = () => (
    <div className="space-y-4">
      {displayEvents.map((event) => (
        <div key={event.id} className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="font-medium">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(event.start), 'PPP')} at {format(new Date(event.start), 'p')}
            </p>
            {event.location && (
              <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
            )}
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs ${
              event.type === 'appointment'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            }`}
          >
            {event.type || 'Event'}
          </div>
        </div>
      ))}
    </div>
  );

  if (!mounted) return null;

  return (
    <motion.div
      className={`col-span-full md:col-span-2 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Upcoming Events</CardTitle>
            <CardDescription>Scheduled appointments and key dates</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAddEvent}>
              Add Event
            </Button>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>View Calendar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading
            ? renderLoadingState()
            : displayEvents.length > 0
              ? renderEvents()
              : renderEmptyState()}
        </CardContent>
      </Card>
    </motion.div>
  );
}

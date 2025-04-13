'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Reminder } from '@/types/reminder';
import { useReminders } from '@/hooks/useReminders';
import { useEffect, useState } from 'react';

interface RemindersWidgetProps {
  maxItems?: number;
  className?: string;
}

export default function RemindersWidget({ maxItems = 5, className = '' }: RemindersWidgetProps) {
  const { reminders, loading, markAsComplete } = useReminders();
  const [mounted, setMounted] = useState(false);
  const [displayReminders, setDisplayReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reminders) {
      // Filter by not completed and sort by date
      const activeReminders = reminders
        .filter((reminder) => !reminder.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, maxItems);

      setDisplayReminders(activeReminders);
    }
  }, [reminders, maxItems]);

  const handleAddReminder = () => {
    // Navigate to the reminders page
    window.location.href = '/reminders?action=add';
  };

  const handleCompleteReminder = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Find the current reminder to check its completion status
      const reminder = reminders.find((r) => r.id === id);
      if (reminder) {
        // If it's already complete, we want to mark it as incomplete, otherwise mark it as complete
        await markAsComplete(id, !reminder.completed);
      }
    } catch (error) {
      console.error('Failed to toggle reminder status:', error);
    }
  };

  // Loading skeletons
  const renderLoadingState = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p>No active reminders</p>
      <Button variant="link" className="mt-2" onClick={handleAddReminder}>
        Create a reminder
      </Button>
    </div>
  );

  // Reminders list
  const renderReminders = () => (
    <div className="space-y-2">
      {displayReminders.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
          onClick={() => (window.location.href = `/reminders?open=${reminder.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.href = `/reminders?open=${reminder.id}`;
            }
          }}
        >
          <button
            onClick={(e) => handleCompleteReminder(reminder.id!, e)}
            className={`w-4 h-4 rounded-full border flex-shrink-0 ${
              reminder.priority === 'high'
                ? 'border-red-500 bg-red-100'
                : reminder.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-100'
                  : 'border-green-500 bg-green-100'
            }`}
            aria-label={`Mark ${reminder.title} as complete`}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{reminder.title}</h3>
            <p className="text-xs text-muted-foreground">
              {format(new Date(reminder.date), 'PPp')}
            </p>
          </div>
          <div className="shrink-0">
            <div
              className={`px-2 py-1 rounded-full text-xs ${
                reminder.type === 'medication'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}
            >
              {reminder.type}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!mounted) return null;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Reminders</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAddReminder}>
              Add Reminder
            </Button>
            <Link href="/reminders">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>All Reminders</span>
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
            : displayReminders.length > 0
              ? renderReminders()
              : renderEmptyState()}
        </CardContent>
      </Card>
    </motion.div>
  );
}

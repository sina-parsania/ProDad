'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import EventsWidget from '@/components/dashboard/EventsWidget';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import DocumentsWidget from '@/components/dashboard/DocumentsWidget';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container max-w-7xl">
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to ProDad, your support companion for the journey of parenthood.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Events Section - 2/3 width on medium screens */}
        <EventsWidget className="md:col-span-2" />

        {/* Reminders Section - 1/3 width on medium screens */}
        <RemindersWidget className="md:col-span-1" />

        {/* Recent Documents Section - full width */}
        <DocumentsWidget className="col-span-full" />
      </div>

      {/* Sync Status */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          All data is stored locally on your device.{' '}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => window.location.reload()}
          >
            Refresh data
          </Button>
        </p>
      </div>
    </div>
  );
}

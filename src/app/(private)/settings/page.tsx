'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReminders } from '@/hooks/useReminders';
import { toast } from 'sonner';
import { clearAllData } from '@/lib/db/db';

export default function SettingsPage() {
  const { requestNotificationPermission } = useReminders();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [dbSize, setDbSize] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Estimate IndexedDB size
    estimateDbSize();
  }, []);

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in your browser');
      return;
    }

    if (Notification.permission === 'granted') {
      toast.info('Notifications already enabled. To disable, use your browser settings.');
      return;
    }

    const allowed = await requestNotificationPermission();
    setNotificationsEnabled(allowed);

    if (allowed) {
      toast.success('Notifications enabled');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        toast.success('All data cleared successfully');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Failed to clear data. Please try again.');
      }
    }
  };

  const estimateDbSize = async () => {
    // This is a simplified example - in a real app you would need to
    // enumerate all object stores and their data
    try {
      const storageEstimate = await navigator.storage?.estimate();
      if (storageEstimate?.usage) {
        const usageInMB = (storageEstimate.usage / (1024 * 1024)).toFixed(2);
        setDbSize(`${usageInMB} MB`);
      }
    } catch (error) {
      console.error('Error estimating DB size:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container max-w-3xl">
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your ProDad experience</p>
        </motion.div>
      </header>

      <div className="space-y-6">
        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Enable Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for reminders and important events
                  </p>
                </div>
                <Button
                  variant={notificationsEnabled ? 'default' : 'outline'}
                  onClick={handleToggleNotifications}
                >
                  {notificationsEnabled ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Mode Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Offline Access</CardTitle>
              <CardDescription>Configure how the app works offline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Offline Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow the app to work without an internet connection
                    </p>
                  </div>
                  <Button
                    variant={offlineMode ? 'default' : 'outline'}
                    onClick={() => {
                      setOfflineMode(!offlineMode);
                      toast.success(offlineMode ? 'Offline mode disabled' : 'Offline mode enabled');
                    }}
                  >
                    {offlineMode ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Storage Usage</h3>
                    <p className="text-sm text-muted-foreground">Current local storage usage</p>
                  </div>
                  <div className="text-sm font-medium">{dbSize ? dbSize : 'Calculating...'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your data and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Clear All Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Permanently delete all your locally stored data including calendar events,
                  reminders, and documents.
                </p>
                <Button variant="destructive" onClick={handleClearData} className="w-fit">
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>About ProDad</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Version</h3>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Made with</h3>
                <p className="text-sm text-muted-foreground">
                  Next.js 15, TypeScript, TailwindCSS, and ❤️
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={() => window.open('https://github.com/sina-parsania/ProDad', '_blank')}
                >
                  View Source Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

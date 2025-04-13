'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  addReminder,
  updateReminder,
  completeReminder,
  deleteReminder,
  addReminderNotification,
  updateReminderNotification,
  getReminderNotification,
} from '@/lib/db/db';
import { Reminder } from '@/types/reminder';
import Push from 'push.js';

// Define types for Push.js since it doesn't come with proper TypeScript definitions
interface PushOptions {
  body?: string;
  icon?: string;
  timeout?: number;
  onClick?: () => void;
}

// Define ServiceWorkerRegistration with periodicSync
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  periodicSync?: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>;
  };
}

export function useReminders() {
  const reminders = useLiveQuery(() => db.reminders.toArray());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (reminders !== undefined) {
      setLoading(false);
    }
  }, [reminders]);

  // Check for due reminders on mount
  useEffect(() => {
    if (!reminders) return;

    const now = new Date();
    const checkAndScheduleReminders = async () => {
      for (const reminder of reminders) {
        if (reminder.completed) continue;

        const reminderTime = new Date(reminder.date).getTime();
        const timeUntilReminder = reminderTime - now.getTime();

        // Schedule reminders that are due within the next 24 hours
        if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) {
          scheduleReminder(reminder, timeUntilReminder);
        }

        // Check for missed reminders (within the last 1 hour)
        if (timeUntilReminder >= -60 * 60 * 1000 && timeUntilReminder <= 0) {
          // Check if notification was already delivered
          const existingNotification = await getReminderNotification(reminder.id!);
          if (!existingNotification || !existingNotification.delivered) {
            showNotification(reminder);

            // Mark as delivered if it exists
            if (existingNotification?.id) {
              await updateReminderNotification(existingNotification.id, { delivered: true });
            }
          }
        }
      }
    };

    checkAndScheduleReminders();

    // Register worker to check reminders periodically
    registerPeriodicCheck();
  }, [reminders]);

  const scheduleReminder = async (reminder: Reminder, delay: number) => {
    // Save the timeout ID to IndexedDB for potential recovery
    const timeoutId = setTimeout(() => {
      showNotification(reminder);
      updateDeliveryStatus(reminder.id!);
    }, delay);

    // Store scheduled reminder with timeout ID in IndexedDB
    const existingNotification = await getReminderNotification(reminder.id!);

    if (existingNotification) {
      // Update existing notification
      await updateReminderNotification(existingNotification.id!, {
        timeoutId: timeoutId.toString(),
        date: reminder.date,
        scheduled: true,
        delivered: false,
      });
    } else {
      // Create new notification record
      await addReminderNotification({
        reminderId: reminder.id!,
        timeoutId: timeoutId.toString(),
        title: reminder.title,
        description: reminder.description,
        date: reminder.date,
        scheduled: true,
        delivered: false,
      });
    }
  };

  const updateDeliveryStatus = async (reminderId: number) => {
    const notification = await getReminderNotification(reminderId);
    if (notification) {
      await updateReminderNotification(notification.id!, { delivered: true });
    }
  };

  const showNotification = (reminder: Reminder) => {
    Push.create(`ProDad Reminder: ${reminder.title}`, {
      body: reminder.description || '',
      icon: '/favicon.ico',
      timeout: 8000,
      onClick: function () {
        window.focus();
        Push.close(`ProDad Reminder: ${reminder.title}`);
      },
    } as PushOptions);
  };

  const registerPeriodicCheck = () => {
    // Register service worker for background notifications if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register periodic sync if available
        if ('periodicSync' in registration) {
          // Using the extended type for registration
          const extendedRegistration = registration as ExtendedServiceWorkerRegistration;
          if (extendedRegistration.periodicSync) {
            // Check if periodic sync is supported and permissioned
            navigator.permissions
              ?.query({ name: 'periodic-background-sync' as PermissionName })
              .then((status) => {
                if (status.state === 'granted' && extendedRegistration.periodicSync) {
                  extendedRegistration.periodicSync
                    .register('check-reminders', {
                      minInterval: 15 * 60 * 1000, // 15 minutes
                    })
                    .catch((syncError: Error) => {
                      console.log(
                        'Periodic sync could not be registered, using fallback:',
                        syncError,
                      );
                      // Fallback to regular sync for unsupported browsers
                      setupFallbackSync();
                    });
                } else {
                  console.log('Periodic background sync permission not granted, using fallback');
                  setupFallbackSync();
                }
              })
              .catch((error) => {
                console.log('Permission query not supported, using fallback:', error);
                setupFallbackSync();
              });
          } else {
            setupFallbackSync();
          }
        } else {
          setupFallbackSync();
        }
      });
    } else {
      setupFallbackSync();
    }
  };

  // Fallback method that uses regular sync
  const setupFallbackSync = () => {
    // Use a regular interval to check for notifications when the app is open
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkForDueReminders();
      }
    }, 60000); // Check every minute when tab is visible

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  };

  // Check for due reminders
  const checkForDueReminders = async () => {
    if (!reminders) return;

    const now = new Date();
    const dueReminders = reminders.filter((reminder) => {
      if (reminder.completed) return false;

      const reminderTime = new Date(reminder.date).getTime();
      const timeUntilReminder = reminderTime - now.getTime();

      // Due within the last hour
      return timeUntilReminder >= -60 * 60 * 1000 && timeUntilReminder <= 0;
    });

    // Show notifications for due reminders
    for (const reminder of dueReminders) {
      const notification = await getReminderNotification(reminder.id!);
      if (!notification?.delivered) {
        showNotification(reminder);

        // If notification exists, mark as delivered
        if (notification?.id) {
          await updateReminderNotification(notification.id, { delivered: true });
        }
      }
    }
  };

  const createReminder = useCallback(
    async (
      newReminder: Omit<Reminder, 'id' | 'synced' | 'createdAt' | 'updatedAt' | 'completed'>,
    ) => {
      try {
        const now = new Date();
        const reminder: Omit<Reminder, 'id'> = {
          ...newReminder,
          completed: false,
          synced: false,
          createdAt: now,
          updatedAt: now,
        };

        const id = await addReminder(reminder);

        // Schedule notification if in the future
        const reminderTime = new Date(reminder.date).getTime();
        const currentTime = now.getTime();
        const timeToReminder = reminderTime - currentTime;

        if (timeToReminder > 0) {
          // Store reminder notification in IndexedDB
          await addReminderNotification({
            reminderId: id,
            title: reminder.title,
            description: reminder.description,
            date: reminder.date,
            scheduled: true,
            delivered: false,
          });

          // Register with Push.js if permission granted
          const hasPermission = Push.Permission.has();
          if (hasPermission) {
            scheduleReminder({ ...reminder, id } as Reminder, timeToReminder);
          }
        }

        return id;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const updateReminderItem = useCallback(
    async (
      id: number,
      changes: Partial<Omit<Reminder, 'id' | 'synced' | 'createdAt' | 'updatedAt'>>,
    ) => {
      try {
        const result = await updateReminder(id, {
          ...changes,
          synced: false,
          updatedAt: new Date(),
        });

        // Clear previous scheduled notification if date changed
        if (changes.date) {
          // Get notification from IndexedDB
          const notification = await getReminderNotification(id);

          if (notification?.timeoutId) {
            // Clear the timeout
            clearTimeout(parseInt(notification.timeoutId));

            // Reschedule if in the future
            const newTime = new Date(changes.date).getTime();
            const currentTime = new Date().getTime();
            const timeToReminder = newTime - currentTime;

            if (timeToReminder > 0) {
              // Get full reminder data
              const reminder = await db.reminders.get(id);
              if (reminder) {
                // Update notification with new data
                await updateReminderNotification(notification.id!, {
                  title: changes.title || reminder.title,
                  description: changes.description || reminder.description,
                  date: changes.date,
                  scheduled: true,
                  delivered: false,
                });

                const hasPermission = Push.Permission.has();
                if (hasPermission) {
                  scheduleReminder(
                    {
                      ...reminder,
                      ...changes,
                    },
                    timeToReminder,
                  );
                }
              }
            }
          }
        }

        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const markAsComplete = useCallback(async (id: number, setCompleted: boolean = true) => {
    try {
      // Update completion status in the database
      await completeReminder(id, setCompleted);

      // Get notification from IndexedDB
      const notification = await getReminderNotification(id);

      if (notification?.timeoutId && setCompleted) {
        // Clear the timeout if marking as complete
        clearTimeout(parseInt(notification.timeoutId));
      }

      // Mark notification as delivered if marking as complete
      if (notification && setCompleted) {
        await updateReminderNotification(notification.id!, { delivered: true });
      } else if (notification && !setCompleted) {
        // If unmarking as complete, reset delivered status
        await updateReminderNotification(notification.id!, { delivered: false });
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const removeReminder = useCallback(async (id: number) => {
    try {
      // Get notification before deleting the reminder
      const notification = await getReminderNotification(id);

      // Clear timeout if it exists
      if (notification?.timeoutId) {
        clearTimeout(parseInt(notification.timeoutId));
      }

      // Delete the reminder (this will also delete associated notifications)
      await deleteReminder(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Get active reminders for today
  const getTodayReminders = useCallback(async () => {
    try {
      if (!reminders) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return reminders.filter((reminder) => {
        const reminderDate = new Date(reminder.date);
        return !reminder.completed && reminderDate >= today && reminderDate < tomorrow;
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [reminders]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      let permissionGranted = false;

      await Push.Permission.request(
        () => {
          permissionGranted = true;
        },
        () => {
          permissionGranted = false;
        },
      );

      // After getting permission, schedule existing reminders
      if (permissionGranted && reminders) {
        const now = new Date();
        reminders.forEach((reminder) => {
          if (reminder.completed) return;

          const reminderTime = new Date(reminder.date).getTime();
          const timeToReminder = reminderTime - now.getTime();

          if (timeToReminder > 0) {
            scheduleReminder(reminder, timeToReminder);
          }
        });
      }

      return permissionGranted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, [reminders]);

  return {
    reminders: reminders || [],
    loading,
    error,
    createReminder,
    updateReminder: updateReminderItem,
    markAsComplete,
    removeReminder,
    getTodayReminders,
    requestNotificationPermission,
  };
}

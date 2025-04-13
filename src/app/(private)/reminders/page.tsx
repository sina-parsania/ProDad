'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReminders } from '@/hooks/useReminders';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Reminder } from '@/types/reminder';
import ReminderDialog from '@/components/reminders/ReminderDialog';

export default function RemindersPage() {
  const {
    reminders,
    loading,
    createReminder,
    updateReminder,
    markAsComplete,
    removeReminder,
    requestNotificationPermission,
  } = useReminders();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Request notification permission when page loads
    const setupNotifications = async () => {
      if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          const allowed = await requestNotificationPermission();
          if (allowed) {
            toast.success('Notifications enabled');
          } else {
            toast.error('Notifications permissions denied');
          }
        }
      }
    };

    setupNotifications();
  }, [requestNotificationPermission]);

  // Check for the 'open' query parameter when the component mounts or reminders change
  useEffect(() => {
    if (mounted && reminders.length > 0) {
      const openReminderId = searchParams.get('open');
      if (openReminderId) {
        const reminderToOpen = reminders.find((r) => r.id === parseInt(openReminderId, 10));
        if (reminderToOpen) {
          setSelectedReminder(reminderToOpen);
          setIsDialogOpen(true);
          // Clear the query parameter to avoid reopening on refresh
          router.replace('/reminders');
        }
      }
    }
  }, [mounted, reminders, searchParams, router]);

  const handleAddReminder = () => {
    setSelectedReminder(null);
    setIsDialogOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsDialogOpen(true);
  };

  const handleSaveReminder = async (reminderData: Partial<Reminder>) => {
    try {
      if (selectedReminder?.id) {
        await updateReminder(selectedReminder.id, reminderData);
        toast.success('Reminder updated successfully');
      } else {
        await createReminder({
          title: reminderData.title || '',
          description: reminderData.description || '',
          date: reminderData.date || new Date(),
          type: reminderData.type || 'task',
          priority: reminderData.priority || 'medium',
          notifyBefore: reminderData.notifyBefore,
          recurring: reminderData.recurring || false,
          recurrencePattern: reminderData.recurrencePattern,
        });
        toast.success('Reminder created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    }
  };

  const handleCompleteReminder = async (id: number) => {
    try {
      // Find the current reminder
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      // Toggle the completion status
      await markAsComplete(id, !reminder.completed);
      toast.success(reminder.completed ? 'Reminder marked as active' : 'Reminder completed');
    } catch (error) {
      console.error('Error toggling reminder status:', error);
      toast.error('Failed to update reminder status');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await removeReminder(id);
      toast.success('Reminder deleted');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  if (!mounted) return null;

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !reminder.completed;
    if (filter === 'completed') return reminder.completed;
    return true;
  });

  // Group reminders by date for better organization
  const groupedReminders = filteredReminders.reduce(
    (acc, reminder) => {
      const date = format(new Date(reminder.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reminder);
      return acc;
    },
    {} as Record<string, Reminder[]>,
  );

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedReminders).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="container max-w-7xl">
      <header className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Track important tasks, medication schedules, and appointments
          </p>
        </motion.div>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
        <Button onClick={handleAddReminder}>Add Reminder</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No reminders found</p>
            <Button variant="link" onClick={handleAddReminder} className="mt-2">
              Create your first reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-lg font-medium mb-2">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                {isToday(date) && (
                  <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </h2>
              <Card className="py-0">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {groupedReminders[date].map((reminder) => (
                      <li key={reminder.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleCompleteReminder(reminder.id!)}
                              className={`mt-1 w-5 h-5 rounded-full border flex-shrink-0 ${
                                reminder.completed ? 'bg-primary border-primary' : 'border-gray-300'
                              }`}
                            >
                              {reminder.completed && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-4 h-4 text-primary-foreground m-auto"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </button>
                            <div
                              className={`flex-1 ${reminder.completed ? 'text-muted-foreground line-through' : ''}`}
                            >
                              <h3 className="font-medium">{reminder.title}</h3>
                              {reminder.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {reminder.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reminder.date), 'h:mm a')}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${reminderTypeColor(
                                    reminder.type,
                                  )}`}
                                >
                                  {reminder.type}
                                </span>
                                {reminder.priority && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${reminderPriorityColor(
                                      reminder.priority,
                                    )}`}
                                  >
                                    {reminder.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReminder(reminder)}
                          >
                            Edit
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <ReminderDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          reminder={selectedReminder}
          onSave={handleSaveReminder}
          onDelete={handleDeleteReminder}
        />
      )}
    </div>
  );
}

// Helper functions
function isToday(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  return date.getTime() === today.getTime();
}

function reminderTypeColor(type: string): string {
  switch (type) {
    case 'medication':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'appointment':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'task':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

function reminderPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

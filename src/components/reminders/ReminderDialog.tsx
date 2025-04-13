'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Reminder } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder | null;
  onSave: (reminder: Partial<Reminder>) => void;
  onDelete: (id: number) => void;
}

export default function ReminderDialog({
  isOpen,
  onClose,
  reminder,
  onSave,
  onDelete,
}: ReminderDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<Reminder['type']>('task');
  const [priority, setPriority] = useState<Reminder['priority']>('medium');
  const [notifyBefore, setNotifyBefore] = useState<number | undefined>(undefined);
  const [recurring, setRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] =
    useState<Reminder['recurrencePattern']>('daily');

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || '');
      setDate(format(new Date(reminder.date), 'yyyy-MM-dd'));
      setTime(format(new Date(reminder.date), 'HH:mm'));
      setType(reminder.type || 'task');
      setPriority(reminder.priority || 'medium');
      setNotifyBefore(reminder.notifyBefore);
      setRecurring(reminder.recurring || false);
      setRecurrencePattern(reminder.recurrencePattern || 'daily');
    } else {
      // Set defaults for new reminder
      const now = new Date();
      const roundedUp = new Date(Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000));

      setTitle('');
      setDescription('');
      setDate(format(now, 'yyyy-MM-dd'));
      setTime(format(roundedUp, 'HH:mm'));
      setType('task');
      setPriority('medium');
      setNotifyBefore(15); // Default to 15 minutes
      setRecurring(false);
      setRecurrencePattern('daily');
    }
  }, [reminder]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reminderDate = new Date(`${date}T${time}`);

    const reminderData: Partial<Reminder> = {
      title,
      description: description || undefined,
      date: reminderDate,
      type,
      priority,
      notifyBefore,
      recurring,
      recurrencePattern: recurring ? recurrencePattern : undefined,
    };

    onSave(reminderData);
  };

  const handleDelete = () => {
    if (reminder?.id) {
      onDelete(reminder.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{reminder ? 'Edit Reminder' : 'Add Reminder'}</CardTitle>
            <CardDescription>
              {reminder ? 'Update reminder details' : 'Create a new reminder'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reminder title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="text-sm font-medium block mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="text-sm font-medium block mb-1">
                  Time
                </label>
                <Input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium block mb-1">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Reminder['type'])}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="task">Task</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="text-sm font-medium block mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Reminder['priority'])}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="notifyBefore" className="text-sm font-medium block mb-1">
                Notify before (minutes)
              </label>
              <Input
                type="number"
                id="notifyBefore"
                value={notifyBefore || ''}
                onChange={(e) =>
                  setNotifyBefore(e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="e.g. 15 minutes"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Recurring Reminder
              </label>
            </div>

            {recurring && (
              <div>
                <label htmlFor="recurrencePattern" className="text-sm font-medium block mb-1">
                  Recurrence Pattern
                </label>
                <select
                  id="recurrencePattern"
                  value={recurrencePattern}
                  onChange={(e) =>
                    setRecurrencePattern(e.target.value as Reminder['recurrencePattern'])
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              {reminder?.id && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <Button type="submit">{reminder ? 'Update' : 'Create'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

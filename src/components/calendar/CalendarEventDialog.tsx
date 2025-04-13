'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface CalendarEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  defaultDates: { start: Date; end: Date } | null;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete: (id: number) => void;
}

export default function CalendarEventDialog({
  isOpen,
  onClose,
  event,
  defaultDates,
  onSave,
  onDelete,
}: CalendarEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('other');
  const [isAllDay, setIsAllDay] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartDate(format(new Date(event.start), 'yyyy-MM-dd'));
      setStartTime(format(new Date(event.start), 'HH:mm'));
      setEndDate(format(new Date(event.end), 'yyyy-MM-dd'));
      setEndTime(format(new Date(event.end), 'HH:mm'));
      setEventType(event.type || 'other');
      setIsAllDay(event.allDay || false);
    } else if (defaultDates) {
      setStartDate(format(new Date(defaultDates.start), 'yyyy-MM-dd'));
      setStartTime(format(new Date(defaultDates.start), 'HH:mm'));
      setEndDate(format(new Date(defaultDates.end), 'yyyy-MM-dd'));
      setEndTime(format(new Date(defaultDates.end), 'HH:mm'));
      setIsAllDay(false);
    }
  }, [event, defaultDates]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${startDate}T${isAllDay ? '00:00' : startTime}`);
    const end = new Date(`${endDate}T${isAllDay ? '23:59' : endTime}`);

    const eventData: Partial<CalendarEvent> = {
      title,
      description,
      location,
      start,
      end,
      allDay: isAllDay,
      type: eventType,
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{event ? 'Edit Event' : 'Add Event'}</CardTitle>
            <CardDescription>
              {event ? 'Update event details' : 'Create a new calendar event'}
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
                placeholder="Event title"
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
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="location" className="text-sm font-medium block mb-1">
                Location
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="allDay" className="text-sm font-medium">
                All Day Event
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="text-sm font-medium block mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {!isAllDay && (
                <div>
                  <label htmlFor="startTime" className="text-sm font-medium block mb-1">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required={!isAllDay}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="text-sm font-medium block mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {!isAllDay && (
                <div>
                  <label htmlFor="endTime" className="text-sm font-medium block mb-1">
                    End Time
                  </label>
                  <Input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required={!isAllDay}
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium block mb-1">
                Event Type
              </label>
              <select
                id="type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="appointment">Appointment</option>
                <option value="medication">Medication</option>
                <option value="check-up">Check-up</option>
                <option value="other">Other</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              {event?.id && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <Button type="submit">{event ? 'Update' : 'Create'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

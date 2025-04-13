'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent, CalendarView } from '@/types/calendar';
import CalendarEventDialog from '@/components/calendar/CalendarEventDialog';
import { toast } from 'sonner';

// Setup localizer for react-big-calendar with date-fns
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const { events, loading, createEvent, updateEvent, removeEvent } = useCalendarEvents();
  const [view, setView] = useState<CalendarView>('month');
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  }, []);

  const handleSaveEvent = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      try {
        if (selectedEvent?.id) {
          // Updating existing event
          await updateEvent(selectedEvent.id, eventData);
          toast.success('Event updated successfully');
        } else if (selectedSlot) {
          // Creating new event
          const newEvent = {
            title: eventData.title || 'Untitled Event',
            start: eventData.start || selectedSlot.start,
            end: eventData.end || selectedSlot.end,
            allDay: eventData.allDay || false,
            description: eventData.description || '',
            location: eventData.location || '',
            type: eventData.type || 'other',
            creatorId: 'current-user', // In a real app, get from auth context
            creatorName: 'Current User', // In a real app, get from auth context
          };

          await createEvent(newEvent);
          toast.success('Event created successfully');
        }

        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error saving event:', error);
        toast.error('Failed to save event');
      }
    },
    [selectedEvent, selectedSlot, createEvent, updateEvent],
  );

  const handleDeleteEvent = useCallback(
    async (eventId: number) => {
      try {
        if (eventId) {
          await removeEvent(eventId);
          toast.success('Event deleted');
          setIsDialogOpen(false);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    },
    [removeEvent],
  );

  if (!mounted) return null;

  return (
    <div className="container max-w-7xl">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Calendar</CardTitle>
              <CardDescription>Manage your appointments and events</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-xs">
                Your Events
              </div>
              <div className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-3 py-1 rounded-full text-xs">
                Synced from Partner
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>Add Event</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[calc(100vh-250px)] min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                views={{
                  month: true,
                  week: true,
                  day: true,
                  agenda: true,
                }}
                style={{ height: '100%' }}
                view={view}
                date={date}
                onNavigate={setDate}
                onView={(newView) => setView(newView as CalendarView)}
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={(event) => {
                  const isCreatedByUser = event.creatorId === 'current-user';
                  return {
                    style: {
                      backgroundColor: isCreatedByUser ? '#3b82f6' : '#8b5cf6',
                      color: 'white',
                    },
                  };
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {isDialogOpen && (
        <CalendarEventDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          event={selectedEvent}
          defaultDates={selectedSlot}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

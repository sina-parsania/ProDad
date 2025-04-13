export interface CalendarEvent {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  creatorId: string;
  creatorName?: string;
  synced: boolean; // Indicates if the event has been synced with the backend
  createdAt: Date;
  updatedAt: Date;
  color?: string; // For visual categorization
  type?: 'appointment' | 'medication' | 'check-up' | 'other';
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

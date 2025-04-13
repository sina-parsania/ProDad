export interface Reminder {
  id?: number;
  title: string;
  description?: string;
  date: Date;
  type: 'medication' | 'appointment' | 'task' | 'other';
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  synced: boolean; // Indicates if the reminder has been synced with the backend
  createdAt: Date;
  updatedAt: Date;
  notifyBefore?: number; // Minutes before to send notification
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  assignedTo?: string; // User ID if assigned to someone specific
}

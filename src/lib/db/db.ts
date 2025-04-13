import Dexie, { Table } from 'dexie';
import { CalendarEvent } from '@/types/calendar';
import { Reminder } from '@/types/reminder';
import { Document } from '@/types/document';
import { User, Partner } from '@/types/user';

// Create an interface for reminder notifications
export interface ReminderNotification {
  id?: number;
  reminderId: number;
  timeoutId?: string;
  title: string;
  description?: string;
  date: Date;
  scheduled: boolean;
  delivered: boolean;
}

// Chat message interface for database storage
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  reactions?: string[];
}

export class ProDadDB extends Dexie {
  calendarEvents!: Table<CalendarEvent>;
  reminders!: Table<Reminder>;
  documents!: Table<Document>;
  reminderNotifications!: Table<ReminderNotification>;
  users!: Table<User>;
  partners!: Table<Partner>;
  chats!: Table<ChatMessage>;

  constructor() {
    super('ProDadDB');
    this.version(1).stores({
      calendarEvents: '++id, title, start, end, allDay, creatorId, synced',
      reminders: '++id, title, date, type, completed, synced',
      documents: '++id, title, type, fileName, fileUrl, fileData, uploadDate, synced',
      reminderNotifications: '++id, reminderId, date, delivered',
      users: '++id, firstName, lastName, updatedAt',
      partners: '++id, firstName, lastName, status, updatedAt',
      chats: '++id, sender, timestamp',
    });
  }
}

export const db = new ProDadDB();

// Helper functions for database operations
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  return await db.calendarEvents.toArray();
}

export async function addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<number> {
  return await db.calendarEvents.add(event as CalendarEvent);
}

export async function updateCalendarEvent(
  id: number,
  changes: Partial<CalendarEvent>,
): Promise<number> {
  return await db.calendarEvents.update(id, changes);
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  await db.calendarEvents.delete(id);
}

export async function getAllReminders(): Promise<Reminder[]> {
  return await db.reminders.toArray();
}

export async function getActiveReminders(): Promise<Reminder[]> {
  return await db.reminders.filter((reminder) => !reminder.completed).toArray();
}

export async function addReminder(reminder: Omit<Reminder, 'id'>): Promise<number> {
  return await db.reminders.add(reminder as Reminder);
}

export async function updateReminder(id: number, changes: Partial<Reminder>): Promise<number> {
  return await db.reminders.update(id, changes);
}

export async function completeReminder(id: number, setCompleted: boolean = true): Promise<void> {
  await db.reminders.update(id, {
    completed: setCompleted,
    synced: false,
    updatedAt: new Date(),
  });
}

export async function deleteReminder(id: number): Promise<void> {
  await db.reminders.delete(id);

  // Also delete any associated notifications
  await db.reminderNotifications.where('reminderId').equals(id).delete();
}

// Functions for managing reminder notifications
export async function addReminderNotification(
  notification: Omit<ReminderNotification, 'id'>,
): Promise<number> {
  return await db.reminderNotifications.add(notification);
}

export async function updateReminderNotification(
  id: number,
  changes: Partial<ReminderNotification>,
): Promise<number> {
  return await db.reminderNotifications.update(id, changes);
}

export async function getReminderNotification(
  reminderId: number,
): Promise<ReminderNotification | undefined> {
  return await db.reminderNotifications.where('reminderId').equals(reminderId).first();
}

export async function deleteReminderNotification(id: number): Promise<void> {
  await db.reminderNotifications.delete(id);
}

export async function deleteReminderNotificationByReminderId(reminderId: number): Promise<void> {
  await db.reminderNotifications.where('reminderId').equals(reminderId).delete();
}

export async function getPendingNotifications(): Promise<ReminderNotification[]> {
  return await db.reminderNotifications.filter((notification) => !notification.delivered).toArray();
}

export async function getAllDocuments(): Promise<Document[]> {
  return await db.documents.toArray();
}

export async function addDocument(document: Omit<Document, 'id'>): Promise<number> {
  return await db.documents.add(document as Document);
}

export async function updateDocument(id: number, changes: Partial<Document>): Promise<number> {
  return await db.documents.update(id, changes);
}

export async function deleteDocument(id: number): Promise<void> {
  await db.documents.delete(id);
}

export async function getRecentItems(): Promise<{
  events: CalendarEvent[];
  reminders: Reminder[];
  documents: Document[];
}> {
  // Get recent items for dashboard
  const currentDate = new Date();

  // Get upcoming events (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const events = await db.calendarEvents
    .where('start')
    .between(currentDate, nextWeek)
    .limit(5)
    .toArray();

  // Get active reminders - convert boolean to 0/1 for IndexedDB compatibility
  const reminders = await db.reminders.where('completed').equals(0).limit(5).toArray();

  // Get recent documents
  const documents = await db.documents.orderBy('uploadDate').reverse().limit(5).toArray();

  return { events, reminders, documents };
}

// User profile functions
export async function getUser(): Promise<User | undefined> {
  const users = await db.users.toArray();
  return users.length > 0 ? users[0] : undefined;
}

export async function saveUser(user: Omit<User, 'id'>): Promise<number> {
  const existingUsers = await db.users.toArray();

  if (existingUsers.length > 0) {
    // Update existing user
    const existingUser = existingUsers[0];
    await db.users.update(existingUser.id!, { ...user, updatedAt: new Date() });
    return existingUser.id!;
  } else {
    // Create new user
    return await db.users.add({ ...user, updatedAt: new Date() });
  }
}

// Partner functions
export async function getPartner(): Promise<Partner | undefined> {
  const partners = await db.partners.toArray();
  return partners.length > 0 ? partners[0] : undefined;
}

export async function savePartner(partner: Omit<Partner, 'id'>): Promise<number> {
  const existingPartners = await db.partners.toArray();

  if (existingPartners.length > 0) {
    // Update existing partner
    const existingPartner = existingPartners[0];
    await db.partners.update(existingPartner.id!, { ...partner, updatedAt: new Date() });
    return existingPartner.id!;
  } else {
    // Create new partner
    return await db.partners.add({ ...partner, updatedAt: new Date() });
  }
}

// Chat message functions
export async function getAllChatMessages(): Promise<ChatMessage[]> {
  return await db.chats.orderBy('timestamp').toArray();
}

export async function addChatMessage(message: ChatMessage): Promise<string> {
  await db.chats.add(message);
  return message.id;
}

export async function updateChatReaction(id: string, reactions: string[]): Promise<number> {
  return await db.chats.update(id, { reactions });
}

export async function clearChatMessages(): Promise<void> {
  await db.chats.clear();
}

// Function to clear all database tables
export async function clearAllData(): Promise<void> {
  try {
    // Clear all tables using individual clear operations
    await db.calendarEvents.clear();
    await db.reminders.clear();
    await db.documents.clear();
    await db.reminderNotifications.clear();
    await db.users.clear();
    await db.partners.clear();
    await db.chats.clear();

    console.log('All database data has been cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

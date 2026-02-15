import Dexie, { type EntityTable } from 'dexie';

/**
 * JSONContent type from TipTap/Novel editor
 * This is a recursive structure representing the editor's document structure
 */
export interface JSONContent {
  type?: string; // Node type (e.g., 'doc', 'paragraph', 'heading')
  content?: JSONContent[]; // Recursive: array of JSONContent
  attrs?: Record<string, any>; // Flexible attributes object
  marks?: Array<Record<string, any>>; // Array of mark objects
  text?: string; // Text content for text nodes
}

/**
 * Journal Entry interface matching Convex schema
 */
export interface JournalEntry {
  dateKey: string; // YYYY-MM-DD format (primary key)
  content: JSONContent | null; // JSONContent from Novel
  updatedAt: number; // timestamp
}

/**
 * Task interface matching Convex schema
 */
export interface Task {
  id?: number; // Auto-incremented primary key
  text: string;
  isCompleted: boolean;
}

/**
 * Event interface matching Convex schema
 */
export interface Event {
  id: string; // UUID string
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format
  location?: string;
  color: string;
  isRepeating?: boolean;
  repeatingType?: "daily" | "weekly" | "monthly";
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

/**
 * IndexedDB database using Dexie
 */
class TrackerDatabase extends Dexie {
  // Typed tables
  journalEntries!: EntityTable<JournalEntry, 'dateKey'>;
  tasks!: EntityTable<Task, 'id'>;
  events!: EntityTable<Event, 'id'>;

  constructor() {
    super('TrackerDB');
    
    // Define database schema
    this.version(1).stores({
      // journalEntries: dateKey is the primary key, indexed by dateKey and updatedAt
      journalEntries: 'dateKey, updatedAt',
      
      // tasks: auto-incremented id
      tasks: '++id, isCompleted',
      
      // events: id is the primary key (UUID), indexed by date for fast queries
      events: 'id, date, createdAt, updatedAt',
    });
  }
}

// Create singleton instance
export const db = new TrackerDatabase();

/**
 * Helper function to generate UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

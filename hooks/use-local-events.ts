import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Event, generateId } from '@/lib/db';

/**
 * Hook to get all events from IndexedDB
 * Equivalent to Convex: useQuery(api.events.list)
 */
export function useEvents() {
  return useLiveQuery(() => db.events.toArray());
}

/**
 * Hook to get events for a specific date
 * Equivalent to Convex: useQuery(api.events.getByDate, { date })
 */
export function useEventsByDate(date: string) {
  return useLiveQuery(
    () => db.events.where('date').equals(date).toArray(),
    [date]
  );
}

/**
 * Hook to get a single event by ID
 * Equivalent to Convex: useQuery(api.events.get, { id })
 */
export function useEvent(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.events.get(id) : undefined,
    [id]
  );
}

/**
 * Hook to create a new event
 * Equivalent to Convex: useMutation(api.events.create)
 */
export function useCreateEvent() {
  return async (args: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const event: Event = {
      ...args,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.events.add(event);
    return event.id;
  };
}

/**
 * Hook to update an existing event
 * Equivalent to Convex: useMutation(api.events.update)
 */
export function useUpdateEvent() {
  return async (args: { id: string } & Partial<Omit<Event, 'id' | 'createdAt'>>) => {
    const { id, ...updates } = args;
    await db.events.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };
}

/**
 * Hook to delete an event
 * Equivalent to Convex: useMutation(api.events.remove)
 */
export function useDeleteEvent() {
  return async (id: string) => {
    await db.events.delete(id);
  };
}

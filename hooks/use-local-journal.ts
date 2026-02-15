import { useLiveQuery } from 'dexie-react-hooks';
import { db, type JournalEntry, type JSONContent } from '@/lib/db';

/**
 * Hook to get a journal entry for a specific date
 * Equivalent to Convex: useQuery(api.journal.get, { dateKey })
 */
export function useJournalEntry(dateKey: string) {
  return useLiveQuery(
    () => db.journalEntries.get(dateKey),
    [dateKey]
  );
}

/**
 * Hook to get journal entries within a date range
 * Equivalent to Convex: useQuery(api.journal.getByDateRange, { startDate, endDate })
 */
export function useJournalEntriesByDateRange(startDate: string, endDate: string) {
  return useLiveQuery(
    () => db.journalEntries
      .where('dateKey')
      .between(startDate, endDate, true, true)
      .toArray(),
    [startDate, endDate]
  );
}

/**
 * Hook to save or update a journal entry
 * Equivalent to Convex: useMutation(api.journal.save)
 */
export function useSaveJournalEntry() {
  return async (args: { dateKey: string; content: JSONContent | null }) => {
    const { dateKey, content } = args;
    const now = Date.now();

    // Check if entry already exists
    const existingEntry = await db.journalEntries.get(dateKey);

    const entry: JournalEntry = {
      dateKey,
      content,
      updatedAt: now,
    };

    if (existingEntry) {
      // Update existing entry
      await db.journalEntries.update(dateKey, entry);
    } else {
      // Create new entry
      await db.journalEntries.add(entry);
    }

    return dateKey;
  };
}

/**
 * Hook to delete a journal entry
 */
export function useDeleteJournalEntry() {
  return async (dateKey: string) => {
    await db.journalEntries.delete(dateKey);
  };
}

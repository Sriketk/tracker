"use client";

import { useEffect, useMemo, Suspense } from "react";
import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { CalendarViewType, Events } from "@/types/event";
import { useEventCalendarStore } from "@/hooks/use-event";
import { useShallow } from "zustand/shallow";
import { useEvents } from "@/hooks/use-local-events";
import { useJournalEntriesByDateRange } from "@/hooks/use-local-journal";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parse } from "date-fns";

export default function Home() {
  const { setView, currentView } = useEventCalendarStore(
    useShallow( ( state ) => ( {
      setView: state.setView,
      currentView: state.currentView,
    } ) )
  );

  // Disable day and days views - show week, month, and year
  const disabledViews: CalendarViewType[] = [
    CalendarViewType.DAY,
    CalendarViewType.DAYS,
  ];

  // Set default view to month on mount, or switch if current view is disabled
  useEffect( () => {
    if (
      currentView === CalendarViewType.DAY ||
      currentView === CalendarViewType.DAYS
    ) {
      setView( CalendarViewType.MONTH );
    }
  }, [ currentView, setView ] );

  // Calculate date range based on current view
  const today = new Date();
  const dateRange = useMemo( () => {
    if ( currentView === CalendarViewType.MONTH ) {
      return {
        startDate: format( startOfMonth( today ), 'yyyy-MM-dd' ),
        endDate: format( endOfMonth( today ), 'yyyy-MM-dd' ),
      };
    } else if ( currentView === CalendarViewType.YEAR ) {
      return {
        startDate: format( startOfYear( today ), 'yyyy-MM-dd' ),
        endDate: format( endOfYear( today ), 'yyyy-MM-dd' ),
      };
    } else {
      // For week view, get a wider range
      const start = new Date( today );
      start.setDate( start.getDate() - 7 );
      const end = new Date( today );
      end.setDate( end.getDate() + 7 );
      return {
        startDate: format( start, 'yyyy-MM-dd' ),
        endDate: format( end, 'yyyy-MM-dd' ),
      };
    }
  }, [ currentView, today ] );

  // Fetch events from IndexedDB
  const localEvents = useEvents();

  // Transform local events to Events type
  const events = useMemo<Events[]>( () => {
    if ( !localEvents ) return [];

    return localEvents.map( ( event ): Events => {
      const startDate = parse( event.date, 'yyyy-MM-dd', new Date() );
      const endDate = event.endTime
        ? parse( event.date, 'yyyy-MM-dd', new Date() )
        : parse( event.date, 'yyyy-MM-dd', new Date() );

      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate,
        endDate,
        startTime: event.startTime,
        endTime: event.endTime || event.startTime,
        isRepeating: event.isRepeating || false,
        repeatingType: event.repeatingType || null,
        location: event.location || '',
        category: '', // Not in schema, defaulting to empty
        color: event.color,
        createdAt: new Date( event.createdAt ),
        updatedAt: new Date( event.updatedAt ),
      };
    } );
  }, [ localEvents ] );

  // Fetch journal entries for the date range from IndexedDB
  const journalEntriesArray = useJournalEntriesByDateRange(
    dateRange.startDate,
    dateRange.endDate
  );

  // Transform array to Record for the calendar component
  const journalEntries = useMemo( () => {
    if ( !journalEntriesArray ) return undefined;

    return journalEntriesArray.reduce( ( acc, entry ) => {
      acc[ entry.dateKey ] = {
        dateKey: entry.dateKey,
        updatedAt: entry.updatedAt,
      };
      return acc;
    }, {} as Record<string, { dateKey: string; updatedAt: number }> );
  }, [ journalEntriesArray ] );

  return (
    <main className="min-h-screen w-full">
      <Suspense fallback={ <div className="min-h-screen w-full flex items-center justify-center">Loading...</div> }>
        <EventCalendar
          events={ events }
          initialDate={ new Date() }
          disabledViews={ disabledViews }
          journalEntries={ journalEntries }
        />
      </Suspense>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { CalendarViewType } from "@/types/event";
import { useEventCalendarStore } from "@/hooks/use-event";
import { useShallow } from "zustand/shallow";

export default function Home() {
  const { setView, currentView } = useEventCalendarStore(
    useShallow((state) => ({
      setView: state.setView,
      currentView: state.currentView,
    }))
  );

  // Disable day and days views - show week, month, and year
  const disabledViews: CalendarViewType[] = [
    CalendarViewType.DAY,
    CalendarViewType.DAYS,
  ];

  // Set default view to month on mount, or switch if current view is disabled
  useEffect(() => {
    if (
      currentView === CalendarViewType.DAY ||
      currentView === CalendarViewType.DAYS
    ) {
      setView(CalendarViewType.MONTH);
    }
  }, [currentView, setView]);

  return (
    <main className="min-h-screen w-full">
      <EventCalendar
        events={[]}
        initialDate={new Date()}
        disabledViews={disabledViews}
      />
    </main>
  );
}

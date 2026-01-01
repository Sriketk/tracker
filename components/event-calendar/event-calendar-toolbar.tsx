'use client';

import { TimeFormatToggle } from './ui/time-format-toggel';
import { CalendarViewType, TimeFormatType } from '@/types/event';
import { useEventCalendarStore } from '@/hooks/use-event';
import { EventCalendarTabs } from './event-calendar-tabs';
import { useShallow } from 'zustand/shallow';
import { useCallback, useState, useEffect } from 'react';
import CalendarSettingsDialog from './event-calendar-setting-dialog';
import { format } from 'date-fns';

interface EventCalendarToolbarProps {
  disabledViews?: CalendarViewType[];
}

export default function EventCalendarToolbar({
  disabledViews = [],
}: EventCalendarToolbarProps = {}) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const {
    timeFormat,
    currentView,
    setView,
    setTimeFormat,
  } = useEventCalendarStore(
    useShallow((state) => ({
      timeFormat: state.timeFormat,
      currentView: state.currentView,
      setView: state.setView,
      setTimeFormat: state.setTimeFormat,
    })),
  );

  // Update current date/time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeFormatChange = useCallback(
    (format: TimeFormatType) => {
      setTimeFormat(format);
    },
    [setTimeFormat],
  );

  const handleViewTypeChange = useCallback(
    (viewType: CalendarViewType) => {
      setView(viewType);
    },
    [setView],
  );

  // Format date and time
  const formattedDate = format(currentDateTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(
    currentDateTime,
    timeFormat === TimeFormatType.HOUR_24 ? 'HH:mm:ss' : 'h:mm:ss a'
  );

  return (
    <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
      <div className="flex flex-col">
        <div className="text-sm font-medium">{formattedDate}</div>
        <div className="text-xs text-muted-foreground">{formattedTime}</div>
      </div>
      <EventCalendarTabs
        viewType={currentView}
        onChange={handleViewTypeChange}
        disabledViews={disabledViews}
      />
      <div className="flex items-center sm:space-x-2">
        <TimeFormatToggle
          format={timeFormat}
          onChange={handleTimeFormatChange}
        />
        <CalendarSettingsDialog />
      </div>
    </div>
  );
}
 

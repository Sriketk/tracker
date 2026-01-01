'use client';

import { TimeFormatToggle } from './ui/time-format-toggel';
import { ViewModeToggle } from './ui/view-mode-toggle';
import { CalendarViewType, TimeFormatType, ViewModeType } from '@/types/event';
import { useEventCalendarStore } from '@/hooks/use-event';
import { EventCalendarTabs } from './event-calendar-tabs';
import { useShallow } from 'zustand/shallow';
import { useCallback } from 'react';
import CalendarSettingsDialog from './event-calendar-setting-dialog';

interface EventCalendarToolbarProps {
  disabledViews?: CalendarViewType[];
}

export default function EventCalendarToolbar({
  disabledViews = [],
}: EventCalendarToolbarProps = {}) {
  const {
    viewMode,
    timeFormat,
    currentView,
    setView,
    setTimeFormat,
    setMode,
  } = useEventCalendarStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      timeFormat: state.timeFormat,
      currentView: state.currentView,
      setView: state.setView,
      setTimeFormat: state.setTimeFormat,
      setMode: state.setMode,
    })),
  );

  const handleTimeFormatChange = useCallback(
    (format: TimeFormatType) => {
      setTimeFormat(format);
    },
    [setTimeFormat],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewModeType) => {
      setMode(mode);
    },
    [setMode],
  );

  const handleViewTypeChange = useCallback(
    (viewType: CalendarViewType) => {
      setView(viewType);
    },
    [setView],
  );

  return (
    <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
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
        <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
        <CalendarSettingsDialog />
      </div>
    </div>
  );
}

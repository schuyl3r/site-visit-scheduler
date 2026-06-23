"use client";

import { useSchedulerStore } from "@/store/useSchedulerStore";
import { DAY_ORDER } from "@/types";
import { DayColumn } from "./DayColumn";

export function WeeklyBoard() {
  const selectedDayFilters = useSchedulerStore((s) => s.selectedDayFilters);
  const visibleDays = DAY_ORDER.filter((d) => selectedDayFilters.includes(d));

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="board-grid grid gap-3 items-start"
        style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(220px, 1fr))` }}
      >
        {visibleDays.map((day) => (
          <DayColumn key={day} day={day} />
        ))}
      </div>
    </div>
  );
}

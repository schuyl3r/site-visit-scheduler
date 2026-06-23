"use client";

import { useSchedulerStore } from "@/store/useSchedulerStore";
import { Day, DAY_ORDER } from "@/types";

const SHORT_NAMES: Record<Day, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const WEEKDAYS: Day[] = ["mon", "tue", "wed", "thu", "fri"];

export function DayFilter() {
  const selectedDayFilters = useSchedulerStore((s) => s.selectedDayFilters);
  const toggleDayFilter = useSchedulerStore((s) => s.toggleDayFilter);
  const setDayFilters = useSchedulerStore((s) => s.setDayFilters);

  const allOn = selectedDayFilters.length === 7;

  return (
    <div className="flex items-center gap-1.5 mb-3.5 flex-wrap bg-surface border border-border rounded-lg px-2.5 py-2">
      <span className="text-[10px] text-muted font-mono uppercase tracking-wide mr-1">Show days</span>
      {DAY_ORDER.map((day) => {
        const on = selectedDayFilters.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggleDayFilter(day)}
            className={`text-[11.5px] font-bold font-mono px-2.5 py-1 rounded-full border transition-colors ${
              on ? "bg-accent border-accent text-accent-foreground" : "bg-surface-2 border-border text-muted hover:border-accent/50"
            }`}
          >
            {SHORT_NAMES[day]}
          </button>
        );
      })}
      <span className="flex-1" />
      <button
        type="button"
        onClick={() => setDayFilters(allOn ? WEEKDAYS : [...DAY_ORDER])}
        className="text-[10.5px] font-mono text-muted border border-border rounded-md px-2 py-1 hover:border-accent/50 hover:text-foreground transition-colors"
      >
        {allOn ? "Weekdays only" : "Show all 7"}
      </button>
    </div>
  );
}

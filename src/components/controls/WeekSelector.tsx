"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { formatWeekLabel } from "@/lib/week";

export function WeekSelector() {
  const currentWeekId = useSchedulerStore((s) => s.currentWeekId);
  const shiftWeek = useSchedulerStore((s) => s.shiftWeek);
  const setWeekFromDate = useSchedulerStore((s) => s.setWeekFromDate);

  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-2 py-1.5">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        title="Previous week"
        className="w-7 h-7 rounded-md bg-surface-2 border border-border flex items-center justify-center hover:bg-accent hover:border-accent transition-colors flex-shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex flex-col items-center gap-0.5 min-w-[170px]">
        <span className="text-[12.5px] font-bold tracking-tight text-center">Week of {formatWeekLabel(currentWeekId)}</span>
        <input
          type="date"
          value={currentWeekId}
          onChange={(e) => e.target.value && setWeekFromDate(e.target.value)}
          title="Jump to a week"
          className="bg-surface-2 border border-border text-muted font-mono text-[10px] rounded px-1.5 py-0.5 [color-scheme:dark]"
        />
      </div>
      <button
        type="button"
        onClick={() => shiftWeek(1)}
        title="Next week"
        className="w-7 h-7 rounded-md bg-surface-2 border border-border flex items-center justify-center hover:bg-accent hover:border-accent transition-colors flex-shrink-0"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

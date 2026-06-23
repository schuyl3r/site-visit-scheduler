"use client";

import { useSchedulerStore } from "@/store/useSchedulerStore";

export function TrafficToggle() {
  const trafficMode = useSchedulerStore((s) => s.trafficMode);
  const toggleTrafficMode = useSchedulerStore((s) => s.toggleTrafficMode);

  return (
    <button
      type="button"
      onClick={toggleTrafficMode}
      title="Toggle Metro Manila traffic estimates"
      className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 hover:border-accent/50 transition-colors"
    >
      <span className="text-sm">🚦</span>
      <span className="text-xs text-muted font-mono whitespace-nowrap">
        Traffic: <b className={trafficMode ? "text-ok" : "text-warn"}>{trafficMode ? "ON" : "OFF"}</b>
      </span>
      <span
        className={`w-8 h-[18px] rounded-full relative transition-colors flex-shrink-0 ${
          trafficMode ? "bg-[#14532d] border border-[#1f7a45]" : "bg-[#3a2a05] border border-[#6b4d0a]"
        }`}
      >
        <span
          className={`absolute top-[1px] w-3.5 h-3.5 rounded-full transition-all ${trafficMode ? "left-[17px] bg-ok" : "left-[1px] bg-warn"}`}
        />
      </span>
    </button>
  );
}

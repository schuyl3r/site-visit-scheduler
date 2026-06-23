"use client";

import { useEffect, useRef, useState } from "react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { DAY_ORDER } from "@/types";
import { DAY_META } from "@/lib/coding";
import { dayDateInWeek, formatShortDate } from "@/lib/week";
import { Button } from "@/components/ui/Button";

export function SelectionBar() {
  const selectMode = useSchedulerStore((s) => s.selectMode);
  const selectedClientIds = useSchedulerStore((s) => s.selectedClientIds);
  const selectedDayFilters = useSchedulerStore((s) => s.selectedDayFilters);
  const currentWeekId = useSchedulerStore((s) => s.currentWeekId);
  const clients = useSchedulerStore((s) => s.clients);
  const exitSelectMode = useSchedulerStore((s) => s.exitSelectMode);
  const bulkMoveSelectedToDay = useSchedulerStore((s) => s.bulkMoveSelectedToDay);
  const bulkMoveSelectedToBacklog = useSchedulerStore((s) => s.bulkMoveSelectedToBacklog);
  const bulkDeleteSelected = useSchedulerStore((s) => s.bulkDeleteSelected);
  const openConfirmDialog = useSchedulerStore((s) => s.openConfirmDialog);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  if (!selectMode) return null;

  const count = selectedClientIds.size;
  const visibleDays = DAY_ORDER.filter((d) => selectedDayFilters.includes(d));

  function handleDelete() {
    const ids = [...selectedClientIds];
    const names = ids.map((id) => clients[id]?.name ?? id);
    const preview = names.slice(0, 4).join(", ") + (names.length > 4 ? ` and ${names.length - 4} more` : "");
    openConfirmDialog({
      title: `Delete ${count} client${count !== 1 ? "s" : ""}?`,
      message: `This will permanently remove ${preview} from all weeks and the backlog. This cannot be undone.`,
      okLabel: `Delete ${count}`,
      danger: true,
      onConfirm: bulkDeleteSelected,
    });
  }

  return (
    <div className="fixed left-1/2 bottom-5 -translate-x-1/2 bg-[#0c1322] border border-[#1e3a5a] rounded-xl px-3.5 py-2.5 flex items-center gap-3.5 z-[1600] shadow-2xl flex-wrap justify-center max-w-[94vw]">
      <span className="text-[12.5px] font-mono text-muted whitespace-nowrap">
        <b className="text-sky-400 text-sm">{count}</b> selected
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="relative" ref={menuRef}>
          <Button variant="default" onClick={() => setMenuOpen((v) => !v)}>
            Move to day ▾
          </Button>
          {menuOpen && (
            <div className="absolute bottom-[calc(100%+6px)] left-0 bg-[#0c1322] border border-[#1e3a5a] rounded-lg p-1.5 min-w-[150px] shadow-xl max-h-60 overflow-y-auto">
              {visibleDays.length === 0 && <div className="text-xs text-muted px-2.5 py-1.5">No days visible</div>}
              {visibleDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    bulkMoveSelectedToDay(day);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left text-xs px-2.5 py-1.5 rounded-md hover:bg-border whitespace-nowrap"
                >
                  {DAY_META[day].name} · {formatShortDate(dayDateInWeek(currentWeekId, day))}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button variant="default" onClick={bulkMoveSelectedToBacklog}>
          → Backlog
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          🗑 Delete
        </Button>
        <Button variant="ghost" onClick={exitSelectMode}>
          Done
        </Button>
      </div>
    </div>
  );
}

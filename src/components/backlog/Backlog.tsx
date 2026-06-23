"use client";

import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { getBacklogClientIds } from "@/lib/clients";
import { containerDroppableId } from "@/components/board/BoardDndProvider";
import { SortableVisitCard } from "@/components/board/SortableVisitCard";

const GRID_GAP_PX = 10;

function currentColumnCount(): number {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

export function Backlog() {
  const clients = useSchedulerStore((s) => s.clients);
  const weeks = useSchedulerStore((s) => s.weeks);
  const selectMode = useSchedulerStore((s) => s.selectMode);
  const selectedClientIds = useSchedulerStore((s) => s.selectedClientIds);
  const toggleClientSelection = useSchedulerStore((s) => s.toggleClientSelection);
  const togglePriority = useSchedulerStore((s) => s.togglePriority);
  const openEditClientForm = useSchedulerStore((s) => s.openEditClientForm);
  const openConfirmDialog = useSchedulerStore((s) => s.openConfirmDialog);
  const deleteClient = useSchedulerStore((s) => s.deleteClient);

  const backlogIds = getBacklogClientIds(clients, weeks);
  const { setNodeRef, isOver } = useDroppable({ id: containerDroppableId("backlog"), data: { containerId: "backlog" } });

  const stripRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  // Cheap fingerprint of whatever can change a card's rendered height, so the
  // measurement effect below also reruns on a content edit, not just a count change.
  const contentSignature = backlogIds
    .map((id) => `${id}:${clients[id]?.notes.length ?? 0}:${clients[id]?.address.length ?? 0}:${clients[id]?.name.length ?? 0}`)
    .join("|");

  // Cap the backlog to ~4 rows tall, then scroll — measures actual rendered
  // card heights so it adapts to content and the current column count.
  useEffect(() => {
    function recompute() {
      const strip = stripRef.current;
      if (!strip) return;
      const cardEls = Array.from(strip.children) as HTMLElement[];
      const cols = currentColumnCount();
      if (cardEls.length > cols * 4) {
        const maxCardHeight = Math.max(...cardEls.map((el) => el.offsetHeight));
        setMaxHeight(maxCardHeight * 4 + GRID_GAP_PX * 3 + 4);
      } else {
        setMaxHeight(undefined);
      }
    }
    recompute();
    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recompute, 150);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [contentSignature]);

  function requestDelete(clientId: string, name: string) {
    openConfirmDialog({
      title: "Remove client?",
      message: `Remove ${name} from the schedule? This removes them from all weeks and the backlog.`,
      okLabel: "Delete",
      danger: true,
      onConfirm: () => deleteClient(clientId),
    });
  }

  return (
    <div
      className={`rounded-lg border bg-surface p-3.5 mt-4 transition-colors ${
        isOver ? "border-accent/70 shadow-[0_0_0_2px_rgba(124,58,237,0.25)_inset]" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
        <span className="text-xs font-bold">📥 Backlog / Deferred</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted">
          {backlogIds.length} card{backlogIds.length !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] text-muted font-mono">Drag or drop here · shared across all weeks</span>
      </div>

      <SortableContext items={backlogIds} strategy={rectSortingStrategy}>
        <div
          ref={(node) => {
            stripRef.current = node;
            setNodeRef(node);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 items-start overflow-y-auto pr-1.5"
          style={{ maxHeight }}
        >
          {!backlogIds.length ? (
            <div className="col-span-full flex items-center justify-center text-ok text-[11px] font-mono py-5">
              ✓ All clients scheduled
            </div>
          ) : (
            backlogIds.map((clientId, i) => {
              const client = clients[clientId];
              if (!client) return null;
              return (
                <SortableVisitCard
                  key={clientId}
                  client={client}
                  containerId="backlog"
                  index={i}
                  selectMode={selectMode}
                  selected={selectedClientIds.has(clientId)}
                  onSelectToggle={() => toggleClientSelection(clientId)}
                  onEdit={() => openEditClientForm(clientId)}
                  onDelete={() => requestDelete(clientId, client.name)}
                  onTogglePriority={() => togglePriority(clientId)}
                />
              );
            })
          )}
        </div>
      </SortableContext>
    </div>
  );
}

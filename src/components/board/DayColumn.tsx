"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Home } from "lucide-react";
import { useSchedulerStore } from "@/store/useSchedulerStore";
import { Day } from "@/types";
import { getCardsForDay } from "@/lib/clients";
import { DAY_META, getCodingInfo } from "@/lib/coding";
import { calcDayTimeline, formatClock, MAX_STOPS_PER_DAY, routeSummary, SlotLoadLevel, visitLoadLevel } from "@/lib/timing";
import { dayDateInWeek, formatShortDate } from "@/lib/week";
import { containerDroppableId } from "./BoardDndProvider";
import { SortableVisitCard } from "./SortableVisitCard";

const LOAD_BADGE_CLASSES: Record<SlotLoadLevel, string> = {
  none: "bg-surface-2 border-border text-muted",
  near: "bg-warn/10 border-warn/40 text-warn",
  full: "bg-danger/10 border-danger/40 text-danger",
  over: "bg-danger/20 border-danger/60 text-danger",
};

interface DayColumnProps {
  day: Day;
}

export function DayColumn({ day }: DayColumnProps) {
  const currentWeekId = useSchedulerStore((s) => s.currentWeekId);
  const week = useSchedulerStore((s) => s.weeks[s.currentWeekId]);
  const clients = useSchedulerStore((s) => s.clients);
  const trafficMode = useSchedulerStore((s) => s.trafficMode);
  const codingOverrides = useSchedulerStore((s) => s.codingOverrides);
  const selectMode = useSchedulerStore((s) => s.selectMode);
  const selectedClientIds = useSchedulerStore((s) => s.selectedClientIds);
  const toggleCodingOverride = useSchedulerStore((s) => s.toggleCodingOverride);
  const selectAllInDay = useSchedulerStore((s) => s.selectAllInDay);
  const toggleClientSelection = useSchedulerStore((s) => s.toggleClientSelection);
  const togglePriority = useSchedulerStore((s) => s.togglePriority);
  const openEditClientForm = useSchedulerStore((s) => s.openEditClientForm);
  const openConfirmDialog = useSchedulerStore((s) => s.openConfirmDialog);
  const deleteClient = useSchedulerStore((s) => s.deleteClient);
  const setCardDuration = useSchedulerStore((s) => s.setCardDuration);

  const cards = getCardsForDay(week, day);
  const cardsWithClients = cards.map((card) => ({ card, client: clients[card.clientId] })).filter((x) => x.client);
  const timeline = calcDayTimeline(cardsWithClients, trafficMode);
  const coding = getCodingInfo(day, currentWeekId, codingOverrides);
  const loadLevel = visitLoadLevel(cards.length);
  const dateLabel = formatShortDate(dayDateInWeek(currentWeekId, day));
  const route = routeSummary(cardsWithClients.map((x) => x.client));
  const allSelected = cardsWithClients.length > 0 && cardsWithClients.every((x) => selectedClientIds.has(x.client.id));
  const { setNodeRef, isOver } = useDroppable({ id: containerDroppableId(day), data: { containerId: day } });

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
      className={`rounded-lg border bg-surface overflow-hidden min-w-0 transition-colors ${isOver ? "border-accent/70 bg-[#100f1e]" : "border-border"}`}
      style={{ borderTop: `3px solid ${DAY_META[day].color}` }}
    >
      <div className="p-3 border-b border-border">
        <div className="flex justify-between items-start gap-1.5 mb-1">
          <div>
            <div className="text-sm font-bold" style={{ color: DAY_META[day].color }}>
              {DAY_META[day].name}
            </div>
            <div className="text-[10px] text-muted font-mono mt-0.5">{dateLabel}</div>
            <div className={`text-[9.5px] font-mono mt-1 flex items-center gap-1.5 ${coding.isFree ? "text-ok" : "text-warn"}`}>
              <span>{coding.isFree ? "✓ No coding" : `⚠️ ${coding.label}`}</span>
              <button
                type="button"
                onClick={() => toggleCodingOverride(day)}
                className="text-[8.5px] px-1.5 py-0.5 rounded border border-current opacity-60 hover:opacity-100 font-mono"
              >
                {coding.isFree ? "set coding" : "clear"}
              </button>
            </div>
          </div>
          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${LOAD_BADGE_CLASSES[loadLevel]}`}>
            {cards.length}/{MAX_STOPS_PER_DAY}
          </span>
        </div>
        <div className="text-[9.5px] text-muted font-mono mt-1 truncate" title={route}>
          {route}
        </div>
        {selectMode && cardsWithClients.length > 0 && (
          <button
            type="button"
            onClick={() => selectAllInDay(day)}
            className="text-[9.5px] font-mono text-accent bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5 mt-1.5 hover:bg-accent/20"
          >
            {allSelected ? "Clear" : "Select all"}
          </button>
        )}
      </div>

      <div ref={setNodeRef} className="p-2 min-h-[70px]">
        <SortableContext items={cardsWithClients.map((x) => x.client.id)} strategy={verticalListSortingStrategy}>
          {!cardsWithClients.length ? (
            <div className="text-center py-6 px-3 text-subtle text-[11px] border-2 border-dashed border-border rounded-lg mt-1">
              Drop cards here
            </div>
          ) : (
            <>
              <div className="text-[10px] text-muted font-mono py-0.5 flex items-center gap-1.5">
                <Home size={11} /> 10:01 AM depart
              </div>
              {cardsWithClients.map(({ card, client }, i) => {
                const stop = timeline.stops[i];
                return (
                  <div key={card.id}>
                    <div className="flex items-center ml-2 gap-1.5 my-0.5">
                      <div className="w-px h-3.5 bg-border" />
                      {stop && <span className="text-[9px] text-subtle font-mono">~{stop.travelMinutes}min</span>}
                    </div>
                    <SortableVisitCard
                      client={client}
                      containerId={day}
                      index={i}
                      stopNumber={i + 1}
                      timing={stop}
                      duration={card.duration}
                      onDurationChange={(minutes) => setCardDuration(card.id, minutes)}
                      selectMode={selectMode}
                      selected={selectedClientIds.has(client.id)}
                      onSelectToggle={() => toggleClientSelection(client.id)}
                      onEdit={() => openEditClientForm(client.id)}
                      onDelete={() => requestDelete(client.id, client.name)}
                      onTogglePriority={() => togglePriority(client.id)}
                    />
                  </div>
                );
              })}
              {timeline.returnLeg && (
                <div className="flex items-center ml-2 gap-1.5 my-0.5">
                  <div className="w-px h-3.5 bg-border" />
                </div>
              )}
              {timeline.returnLeg && (
                <div className={`text-[10px] font-mono py-0.5 flex items-center gap-1.5 ${timeline.returnLeg.isLate ? "text-danger" : "text-ok"}`}>
                  <Home size={11} /> Back ~{formatClock(timeline.returnLeg.arrival)} {timeline.returnLeg.isLate ? "⚠️ near coding" : "✓"}
                </div>
              )}
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

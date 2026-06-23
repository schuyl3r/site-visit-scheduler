import { useEffect, useMemo, useState } from "react";
import { addWeeks, parseISO } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  AppState,
  ClientFormInput,
  ConfirmDialogState,
  Day,
  DAY_ORDER,
  VisitCard,
} from "@/types";
import { baseTravelMinutesForCity, cityKey } from "@/lib/travel";
import { DEFAULT_VISIT_DURATION, clampDuration } from "@/lib/timing";
import { DAY_META, codingOverrideKey, isCodingFree } from "@/lib/coding";
import { dayFromDate, formatShortDate, formatWeekLabel, snapToMonday, todayISO, weekKey } from "@/lib/week";
import { generateClientId, generateVisitCardId } from "@/lib/id";
import { findDuplicateClients, getCardsForDay, sanitizeWeeks } from "@/lib/clients";
import { ImportPayload } from "@/lib/exportImport";
import { createInitialState } from "./seedData";

interface ToastState {
  message: string;
  id: number;
}

type ClientFormState = { mode: "add" } | { mode: "edit"; clientId: string } | null;

interface SchedulerUiState {
  selectMode: boolean;
  selectedClientIds: Set<string>;
  toast: ToastState | null;
  clientForm: ClientFormState;
  confirmDialog: ConfirmDialogState | null;
}

interface SchedulerActions {
  // week navigation
  shiftWeek: (deltaWeeks: number) => void;
  setWeekFromDate: (dateISO: string) => void;

  // traffic
  setTrafficMode: (on: boolean) => void;
  toggleTrafficMode: () => void;

  // day filter
  toggleDayFilter: (day: Day) => void;
  setDayFilters: (days: Day[]) => void;

  // coding overrides
  toggleCodingOverride: (day: Day) => void;

  // client CRUD
  checkDuplicates: (name: string, exceptId?: string) => { id: string; name: string; where: string[] }[];
  commitClient: (input: ClientFormInput, editingClientId?: string) => void;
  deleteClient: (clientId: string) => void;
  togglePriority: (clientId: string) => void;

  // drag-and-drop / placement (scoped to currentWeekId)
  moveClientCard: (clientId: string, targetDay: Day, targetIndex: number) => void;
  moveClientToBacklog: (clientId: string) => void;
  setCardDuration: (cardId: string, minutes: number) => void;

  // select mode + bulk actions
  enterSelectMode: () => void;
  exitSelectMode: () => void;
  toggleSelectMode: () => void;
  toggleClientSelection: (clientId: string) => void;
  selectAllInDay: (day: Day) => void;
  bulkMoveSelectedToDay: (day: Day) => void;
  bulkMoveSelectedToBacklog: () => void;
  bulkDeleteSelected: () => void;

  // export / import
  importSnapshot: (payload: ImportPayload) => void;

  // toast
  showToast: (message: string) => void;
  clearToast: () => void;

  // client form modal
  openAddClientForm: () => void;
  openEditClientForm: (clientId: string) => void;
  closeClientForm: () => void;

  // confirm dialog
  openConfirmDialog: (dialog: ConfirmDialogState) => void;
  closeConfirmDialog: () => void;
}

export type SchedulerStore = AppState & SchedulerUiState & SchedulerActions;

function nextToast(message: string): ToastState {
  return { message, id: Date.now() + Math.random() };
}

/** Re-keys a day's cards 0..n-1 by current order, e.g. after a card leaves. */
function renumber(cards: VisitCard[]): VisitCard[] {
  return cards.map((vc, i) => ({ ...vc, order: i }));
}

/** Removes cards for `clientIds` from `visitCards`, renumbering any day(s) they vacated. */
function removeCardsAndRenumberSource(visitCards: VisitCard[], clientIds: string[]): VisitCard[] {
  const removedIds = new Set(clientIds);
  const affectedDays = new Set(visitCards.filter((vc) => removedIds.has(vc.clientId)).map((vc) => vc.day));
  const remaining = visitCards.filter((vc) => !removedIds.has(vc.clientId));
  if (!affectedDays.size) return remaining;
  const untouched = remaining.filter((vc) => !affectedDays.has(vc.day));
  const renumbered = [...affectedDays].flatMap((day) =>
    renumber(remaining.filter((vc) => vc.day === day).sort((a, b) => a.order - b.order)),
  );
  return [...untouched, ...renumbered];
}

export const useSchedulerStore = create<SchedulerStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      selectMode: false,
      selectedClientIds: new Set<string>(),
      toast: null,
      clientForm: null,
      confirmDialog: null,

      shiftWeek: (deltaWeeks) =>
        set((state) => {
          const nextId = weekKey(snapToMonday(addWeeks(parseISO(state.currentWeekId), deltaWeeks)));
          const weeks = state.weeks[nextId]
            ? state.weeks
            : { ...state.weeks, [nextId]: { id: nextId, label: formatWeekLabel(nextId), visitCards: [] } };
          return { currentWeekId: nextId, weeks, selectMode: false, selectedClientIds: new Set<string>() };
        }),

      setWeekFromDate: (dateISO) =>
        set((state) => {
          const nextId = weekKey(snapToMonday(parseISO(dateISO)));
          const weeks = state.weeks[nextId]
            ? state.weeks
            : { ...state.weeks, [nextId]: { id: nextId, label: formatWeekLabel(nextId), visitCards: [] } };
          return { currentWeekId: nextId, weeks, selectMode: false, selectedClientIds: new Set<string>() };
        }),

      setTrafficMode: (on) => set({ trafficMode: on }),
      toggleTrafficMode: () =>
        set((state) => ({
          trafficMode: !state.trafficMode,
          toast: nextToast(!state.trafficMode ? "Traffic estimates ON" : "Showing free-flow (no-traffic) times"),
        })),

      toggleDayFilter: (day) =>
        set((state) => {
          const isVisible = state.selectedDayFilters.includes(day);
          if (isVisible && state.selectedDayFilters.length === 1) {
            return { toast: nextToast("Keep at least one day visible") };
          }
          const next = isVisible
            ? state.selectedDayFilters.filter((d) => d !== day)
            : [...state.selectedDayFilters, day];
          return { selectedDayFilters: DAY_ORDER.filter((d) => next.includes(d)) };
        }),

      setDayFilters: (days) => set({ selectedDayFilters: DAY_ORDER.filter((d) => days.includes(d)) }),

      toggleCodingOverride: (day) =>
        set((state) => {
          const key = codingOverrideKey(state.currentWeekId, day);
          const current = isCodingFree(day, state.currentWeekId, state.codingOverrides);
          return { codingOverrides: { ...state.codingOverrides, [key]: !current } };
        }),

      checkDuplicates: (name, exceptId) => {
        const state = get();
        return findDuplicateClients(state.clients, state.weeks, name, exceptId);
      },

      commitClient: (input, editingClientId) => {
        const ck = cityKey(input.city);
        const baseTravelMinutes = baseTravelMinutesForCity(ck);
        let placedDay: Day | undefined;
        let placedWeekId: string | undefined;
        if (input.dateISO) {
          const date = parseISO(input.dateISO);
          placedWeekId = weekKey(snapToMonday(date));
          placedDay = dayFromDate(date);
        }

        set((state) => {
          const clients = { ...state.clients };
          const clientId = editingClientId ?? generateClientId(input.name);

          if (editingClientId && clients[editingClientId]) {
            clients[editingClientId] = {
              ...clients[editingClientId],
              name: input.name,
              address: input.address,
              city: input.city,
              cityKey: ck,
              notes: input.notes,
              priority: input.priority,
              baseTravelMinutes,
              date: input.dateISO || clients[editingClientId].date,
            };
          } else {
            clients[clientId] = {
              id: clientId,
              name: input.name,
              address: input.address,
              city: input.city,
              cityKey: ck,
              notes: input.notes,
              priority: input.priority,
              date: input.dateISO || todayISO(),
              baseTravelMinutes,
              createdAt: new Date().toISOString(),
            };
          }

          // A client has at most one VisitCard — carry its duration forward (if any)
          // before removing it, so re-scheduling doesn't silently reset a customized
          // visit length back to the default.
          const priorDuration = Object.values(state.weeks)
            .flatMap((week) => week.visitCards)
            .find((vc) => vc.clientId === clientId)?.duration;

          let weeks = Object.fromEntries(
            Object.entries(state.weeks).map(([id, week]) => [
              id,
              { ...week, visitCards: week.visitCards.filter((vc) => vc.clientId !== clientId) },
            ]),
          );

          if (placedWeekId && placedDay) {
            if (!weeks[placedWeekId]) {
              weeks = { ...weeks, [placedWeekId]: { id: placedWeekId, label: formatWeekLabel(placedWeekId), visitCards: [] } };
            }
            const week = weeks[placedWeekId];
            const dayCount = week.visitCards.filter((vc) => vc.day === placedDay).length;
            weeks = {
              ...weeks,
              [placedWeekId]: {
                ...week,
                visitCards: [
                  ...week.visitCards,
                  {
                    id: generateVisitCardId(),
                    clientId,
                    weekId: placedWeekId,
                    day: placedDay,
                    order: dayCount,
                    duration: priorDuration ?? DEFAULT_VISIT_DURATION,
                  },
                ],
              },
            };
          }

          return { clients, weeks };
        });

        const { currentWeekId, showToast } = get();
        if (placedDay && placedWeekId) {
          const sameWeek = placedWeekId === currentWeekId;
          const dateLabel = formatShortDate(parseISO(input.dateISO));
          showToast(
            `${input.name} ${editingClientId ? "moved" : "scheduled"} to ${DAY_META[placedDay].name}, ${dateLabel}${sameWeek ? "" : " — switch weeks to see it"}`,
          );
        } else {
          showToast(editingClientId ? `${input.name} updated` : `${input.name} added to Backlog`);
        }
      },

      deleteClient: (clientId) =>
        set((state) => {
          const client = state.clients[clientId];
          const clients = { ...state.clients };
          delete clients[clientId];
          const weeks = Object.fromEntries(
            Object.entries(state.weeks).map(([id, week]) => [
              id,
              { ...week, visitCards: week.visitCards.filter((vc) => vc.clientId !== clientId) },
            ]),
          );
          const selectedClientIds = new Set(state.selectedClientIds);
          selectedClientIds.delete(clientId);
          const clientForm =
            state.clientForm?.mode === "edit" && state.clientForm.clientId === clientId ? null : state.clientForm;
          return {
            clients,
            weeks,
            selectedClientIds,
            clientForm,
            toast: nextToast(client ? `${client.name} removed` : "Client removed"),
          };
        }),

      togglePriority: (clientId) =>
        set((state) => {
          const client = state.clients[clientId];
          if (!client) return {};
          const updated = { ...client, priority: !client.priority };
          return {
            clients: { ...state.clients, [clientId]: updated },
            toast: nextToast(updated.priority ? `${client.name} marked priority` : `${client.name} priority removed`),
          };
        }),

      moveClientCard: (clientId, targetDay, targetIndex) =>
        set((state) => {
          const weekId = state.currentWeekId;
          const week = state.weeks[weekId] ?? { id: weekId, label: formatWeekLabel(weekId), visitCards: [] };
          const existing = week.visitCards.find((vc) => vc.clientId === clientId);
          const duration = existing?.duration ?? DEFAULT_VISIT_DURATION;

          // `targetIndex` is the drop target's index in the pre-drag list (it still
          // includes the dragged card). When reordering within the same day and the
          // card moves forward, removing it first shifts everything after it back by
          // one, so the captured index overshoots by one unless corrected here.
          const adjustedTargetIndex =
            existing && existing.day === targetDay && targetIndex > existing.order ? targetIndex - 1 : targetIndex;

          const withoutMoved = removeCardsAndRenumberSource(week.visitCards, [clientId]);

          const targetDayCards = withoutMoved.filter((vc) => vc.day === targetDay).sort((a, b) => a.order - b.order);
          const insertIndex = Math.max(0, Math.min(adjustedTargetIndex, targetDayCards.length));
          const movedCard: VisitCard = existing
            ? { ...existing, day: targetDay, weekId, order: 0 }
            : { id: generateVisitCardId(), clientId, weekId, day: targetDay, order: 0, duration };
          targetDayCards.splice(insertIndex, 0, movedCard);
          const renumberedTarget = renumber(targetDayCards);

          const otherCards = withoutMoved.filter((vc) => vc.day !== targetDay);

          return { weeks: { ...state.weeks, [weekId]: { ...week, visitCards: [...otherCards, ...renumberedTarget] } } };
        }),

      moveClientToBacklog: (clientId) =>
        set((state) => {
          const weekId = state.currentWeekId;
          const week = state.weeks[weekId];
          if (!week) return {};
          if (!week.visitCards.some((vc) => vc.clientId === clientId)) return {};
          const visitCards = removeCardsAndRenumberSource(week.visitCards, [clientId]);
          return { weeks: { ...state.weeks, [weekId]: { ...week, visitCards } } };
        }),

      setCardDuration: (cardId, minutes) =>
        set((state) => {
          const weekId = state.currentWeekId;
          const week = state.weeks[weekId];
          if (!week) return {};
          const clamped = clampDuration(minutes);
          return {
            weeks: {
              ...state.weeks,
              [weekId]: {
                ...week,
                visitCards: week.visitCards.map((vc) => (vc.id === cardId ? { ...vc, duration: clamped } : vc)),
              },
            },
          };
        }),

      enterSelectMode: () => set({ selectMode: true, selectedClientIds: new Set<string>() }),
      exitSelectMode: () => set({ selectMode: false, selectedClientIds: new Set<string>() }),
      toggleSelectMode: () =>
        set((state) =>
          state.selectMode
            ? { selectMode: false, selectedClientIds: new Set<string>() }
            : { selectMode: true, selectedClientIds: new Set<string>() },
        ),

      toggleClientSelection: (clientId) =>
        set((state) => {
          const next = new Set(state.selectedClientIds);
          if (next.has(clientId)) next.delete(clientId);
          else next.add(clientId);
          return { selectedClientIds: next };
        }),

      selectAllInDay: (day) =>
        set((state) => {
          const week = state.weeks[state.currentWeekId];
          const dayClientIds = getCardsForDay(week, day).map((vc) => vc.clientId);
          const allSelected = dayClientIds.length > 0 && dayClientIds.every((id) => state.selectedClientIds.has(id));
          const next = new Set(state.selectedClientIds);
          if (allSelected) dayClientIds.forEach((id) => next.delete(id));
          else dayClientIds.forEach((id) => next.add(id));
          return { selectMode: true, selectedClientIds: next };
        }),

      bulkMoveSelectedToDay: (day) =>
        set((state) => {
          const ids = [...state.selectedClientIds];
          if (!ids.length) return { toast: nextToast("Nothing selected") };
          const weekId = state.currentWeekId;
          const week = state.weeks[weekId] ?? { id: weekId, label: formatWeekLabel(weekId), visitCards: [] };
          const priorById = new Map(week.visitCards.map((vc) => [vc.clientId, vc]));
          const remaining = removeCardsAndRenumberSource(week.visitCards, ids);
          const existingDayCards = remaining.filter((vc) => vc.day === day).sort((a, b) => a.order - b.order);
          const otherCards = remaining.filter((vc) => vc.day !== day);
          const moved = ids.map((clientId, i) => {
            const prior = priorById.get(clientId);
            return {
              id: prior?.id ?? generateVisitCardId(),
              clientId,
              weekId,
              day,
              order: existingDayCards.length + i,
              duration: prior?.duration ?? DEFAULT_VISIT_DURATION,
            };
          });
          return {
            weeks: { ...state.weeks, [weekId]: { ...week, visitCards: [...otherCards, ...existingDayCards, ...moved] } },
            selectMode: false,
            selectedClientIds: new Set<string>(),
            toast: nextToast(`${ids.length} card${ids.length !== 1 ? "s" : ""} moved to ${DAY_META[day].name}`),
          };
        }),

      bulkMoveSelectedToBacklog: () =>
        set((state) => {
          const ids = [...state.selectedClientIds];
          if (!ids.length) return { toast: nextToast("Nothing selected") };
          const weekId = state.currentWeekId;
          const week = state.weeks[weekId];
          const weeks = week
            ? { ...state.weeks, [weekId]: { ...week, visitCards: removeCardsAndRenumberSource(week.visitCards, ids) } }
            : state.weeks;
          return {
            weeks,
            selectMode: false,
            selectedClientIds: new Set<string>(),
            toast: nextToast(`${ids.length} card${ids.length !== 1 ? "s" : ""} moved to backlog`),
          };
        }),

      bulkDeleteSelected: () =>
        set((state) => {
          const ids = [...state.selectedClientIds];
          if (!ids.length) return { toast: nextToast("Nothing selected") };
          const clients = { ...state.clients };
          ids.forEach((id) => delete clients[id]);
          const weeks = Object.fromEntries(
            Object.entries(state.weeks).map(([id, week]) => [
              id,
              { ...week, visitCards: week.visitCards.filter((vc) => !ids.includes(vc.clientId)) },
            ]),
          );
          return {
            clients,
            weeks,
            selectMode: false,
            selectedClientIds: new Set<string>(),
            toast: nextToast(`${ids.length} client${ids.length !== 1 ? "s" : ""} removed`),
          };
        }),

      importSnapshot: (payload) =>
        set((state) => {
          // `config` (and each of its fields) may be missing or malformed — the
          // file could be hand-edited, truncated, or from an older/future version.
          // Fall back to current settings rather than crashing on any gap.
          const config = payload.config ?? {};
          const weeks = sanitizeWeeks(payload.clients, payload.weeks);
          const importedWeekIds = Object.keys(weeks);
          const selectedDayFilters =
            Array.isArray(config.selectedDayFilters) && config.selectedDayFilters.length
              ? DAY_ORDER.filter((d) => config.selectedDayFilters!.includes(d))
              : state.selectedDayFilters;

          return {
            clients: payload.clients,
            weeks,
            currentWeekId:
              typeof config.currentWeekId === "string" ? config.currentWeekId : importedWeekIds[0] ?? state.currentWeekId,
            trafficMode: typeof config.trafficMode === "boolean" ? config.trafficMode : state.trafficMode,
            selectedDayFilters,
            codingOverrides:
              config.codingOverrides && typeof config.codingOverrides === "object"
                ? config.codingOverrides
                : state.codingOverrides,
            selectMode: false,
            selectedClientIds: new Set<string>(),
            confirmDialog: null,
            clientForm: null,
            toast: nextToast(
              `Imported ${Object.keys(payload.clients).length} clients across ${importedWeekIds.length} week${importedWeekIds.length !== 1 ? "s" : ""}`,
            ),
          };
        }),

      showToast: (message) => set({ toast: nextToast(message) }),
      clearToast: () => set({ toast: null }),

      openAddClientForm: () => set({ clientForm: { mode: "add" } }),
      openEditClientForm: (clientId) => set({ clientForm: { mode: "edit", clientId } }),
      closeClientForm: () => set({ clientForm: null }),

      openConfirmDialog: (dialog) => set({ confirmDialog: dialog }),
      closeConfirmDialog: () => set({ confirmDialog: null }),
    }),
    {
      name: "site-visit-scheduler",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        clients: state.clients,
        weeks: state.weeks,
        currentWeekId: state.currentWeekId,
        trafficMode: state.trafficMode,
        selectedDayFilters: state.selectedDayFilters,
        codingOverrides: state.codingOverrides,
      }),
    },
  ),
);

/**
 * Triggers persist's localStorage rehydration on mount (skipped automatically
 * during SSR via skipHydration) and reports once it's done, so the page can
 * avoid a flash of seed data before the user's real saved state loads.
 */
export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.resolve(useSchedulerStore.persist.rehydrate()).finally(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);
  return hydrated;
}

/** Set<Day> view of selectedDayFilters for consumers that want set semantics (spec calls for Set<Day>). */
export function useVisibleDaySet(): Set<Day> {
  const days = useSchedulerStore((state) => state.selectedDayFilters);
  return useMemo(() => new Set(days), [days]);
}

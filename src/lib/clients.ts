import { Client, Day, VisitCard, Week } from "@/types";
import { DAY_META } from "./coding";
import { dayDateInWeek, formatShortDate } from "./week";

/** All VisitCards for `clientId` across every week. Normally at most one. */
export function findCardsForClient(weeks: Record<string, Week>, clientId: string): VisitCard[] {
  return Object.values(weeks).flatMap((week) => week.visitCards.filter((vc) => vc.clientId === clientId));
}

/** Clients with no VisitCard anywhere — the shared, week-independent backlog. */
export function getBacklogClientIds(clients: Record<string, Client>, weeks: Record<string, Week>): string[] {
  const placed = new Set(Object.values(weeks).flatMap((week) => week.visitCards.map((vc) => vc.clientId)));
  return Object.keys(clients).filter((id) => !placed.has(id));
}

export function getCardsForDay(week: Week | undefined, day: Day): VisitCard[] {
  if (!week) return [];
  return week.visitCards.filter((vc) => vc.day === day).sort((a, b) => a.order - b.order);
}

/** Human-readable list of where a client is currently scheduled, e.g. "Tuesday, Jun 3", or "Backlog". */
export function describeClientPlacements(weeks: Record<string, Week>, clientId: string): string[] {
  const spots = findCardsForClient(weeks, clientId).map((vc) => {
    const date = dayDateInWeek(vc.weekId, vc.day);
    return `${DAY_META[vc.day].name}, ${formatShortDate(date)}`;
  });
  return spots.length ? spots : ["Backlog"];
}

export interface DuplicateMatch {
  id: string;
  name: string;
  where: string[];
}

/** Case-insensitive name collision check, skipping `exceptId` (the client being edited). */
export function findDuplicateClients(
  clients: Record<string, Client>,
  weeks: Record<string, Week>,
  name: string,
  exceptId?: string,
): DuplicateMatch[] {
  const norm = name.trim().toLowerCase();
  if (!norm) return [];
  return Object.values(clients)
    .filter((c) => c.id !== exceptId && c.name.trim().toLowerCase() === norm)
    .map((c) => ({ id: c.id, name: c.name, where: describeClientPlacements(weeks, c.id) }));
}

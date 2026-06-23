import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { Day, DAY_ORDER } from "@/types";

/** Snaps any date to the Monday of its week. */
export function snapToMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function weekKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseWeekKey(key: string): Date {
  return parseISO(key);
}

export function dayOffset(day: Day): number {
  return DAY_ORDER.indexOf(day);
}

/** Maps a Date to its Day key (Mon=mon ... Sun=sun). */
export function dayFromDate(date: Date): Day {
  const mondayIndexed = (date.getDay() + 6) % 7;
  return DAY_ORDER[mondayIndexed];
}

export function dayDateInWeek(weekId: string, day: Day): Date {
  return addDays(parseWeekKey(weekId), dayOffset(day));
}

export function formatShortDate(date: Date): string {
  return format(date, "MMM d");
}

export function formatWeekLabel(weekId: string): string {
  const monday = parseWeekKey(weekId);
  const sunday = addDays(monday, 6);
  return `${formatShortDate(monday)} – ${formatShortDate(sunday)}, ${format(sunday, "yyyy")}`;
}

export function formatCardDate(dateISO: string): string {
  if (!dateISO) return "";
  return format(parseISO(dateISO), "EEE, MMM d");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

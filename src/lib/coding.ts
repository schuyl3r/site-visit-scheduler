import { Day } from "@/types";

/**
 * Number-coding (vehicle window-ban) rules per weekday, migrated from the
 * original index.html DAYS table. Coding plates are fixed per weekday;
 * Monday and weekends are coding-free by default.
 */
export interface DayMeta {
  name: string;
  /** e.g. "Plates 1 & 2", or "No coding" for naturally free days. */
  codingLabel: string;
  /** True when this weekday has no coding restriction by default. */
  defaultFree: boolean;
  color: string;
}

export const DAY_META: Record<Day, DayMeta> = {
  mon: { name: "Monday", codingLabel: "Plates 1 & 2", defaultFree: false, color: "#94a3b8" },
  tue: { name: "Tuesday", codingLabel: "Plates 3 & 4", defaultFree: false, color: "#60a5fa" },
  wed: { name: "Wednesday", codingLabel: "Plates 5 & 6", defaultFree: false, color: "#c084fc" },
  thu: { name: "Thursday", codingLabel: "Plates 7 & 8", defaultFree: false, color: "#f97316" },
  fri: { name: "Friday", codingLabel: "Plates 9 & 0", defaultFree: false, color: "#4ade80" },
  sat: { name: "Saturday", codingLabel: "No coding", defaultFree: true, color: "#fbbf24" },
  sun: { name: "Sunday", codingLabel: "No coding", defaultFree: true, color: "#f472b6" },
};

export function codingOverrideKey(weekId: string, day: Day): string {
  return `${weekId}:${day}`;
}

/** Resolves whether `day` in `weekId` is coding-free, honoring any per-week override. */
export function isCodingFree(
  day: Day,
  weekId: string,
  overrides: Record<string, boolean>,
): boolean {
  const key = codingOverrideKey(weekId, day);
  return overrides[key] ?? DAY_META[day].defaultFree;
}

export interface CodingInfo {
  label: string;
  isFree: boolean;
}

/** Display label for a day's coding header, e.g. "✓ No coding" or "⚠️ Plates 1 & 2". */
export function getCodingInfo(
  day: Day,
  weekId: string,
  overrides: Record<string, boolean>,
): CodingInfo {
  const free = isCodingFree(day, weekId, overrides);
  const label = free ? "No coding" : DAY_META[day].codingLabel;
  return { label, isFree: free };
}

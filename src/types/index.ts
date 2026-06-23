export const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type Day = (typeof DAY_ORDER)[number];

export interface Client {
  id: string;
  name: string;
  address: string;
  city: string;
  /** Short key derived from `city`, used for travel lookups + badge tinting. */
  cityKey: string;
  notes: string;
  priority: boolean;
  /** ISO yyyy-mm-dd. The date this client was added/requested for — shown on the card. */
  date: string;
  /** Fallback travel minutes from base when no city-pair lookup applies. */
  baseTravelMinutes: number;
  /** ISO timestamp, stable sort fallback for seed data. */
  createdAt: string;
}

export interface VisitCard {
  id: string;
  clientId: string;
  weekId: string;
  day: Day;
  order: number;
  /** Minutes on-site, clamped to [30, 90]. */
  duration: number;
}

export interface Week {
  /** yyyy-mm-dd of that week's Monday. */
  id: string;
  /** e.g. "Jun 23–29, 2026" */
  label: string;
  visitCards: VisitCard[];
}

export interface AppState {
  clients: Record<string, Client>;
  weeks: Record<string, Week>;
  currentWeekId: string;
  trafficMode: boolean;
  /**
   * Ordered subset of DAY_ORDER. Modeled as Set<Day> conceptually, but kept
   * as an array since Sets don't round-trip through JSON/localStorage.
   */
  selectedDayFilters: Day[];
  /** key `${weekId}:${day}` -> true (no coding) / false (coding enforced). */
  codingOverrides: Record<string, boolean>;
}

/** Shape submitted by ClientForm for both create and edit. */
export interface ClientFormInput {
  name: string;
  address: string;
  city: string;
  notes: string;
  priority: boolean;
  /** ISO yyyy-mm-dd, or '' to leave/send to Backlog. */
  dateISO: string;
}

/** Generic confirm dialog payload, replacing native confirm()/alert(). */
export interface ConfirmDialogState {
  title: string;
  message: string;
  /** Optional extra lines rendered as a list (e.g. duplicate placements, bulk-delete preview). */
  detailLines?: string[];
  okLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

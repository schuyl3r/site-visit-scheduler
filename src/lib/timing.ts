import { Client, VisitCard } from "@/types";
import { applyTraffic, travelMinutes } from "./travel";

export const VISIT_DURATION_MIN = 30;
export const VISIT_DURATION_MAX = 90;
export const DEFAULT_VISIT_DURATION = 45;

export const MAX_STOPS_PER_DAY = 4;

export const WORKDAY_START_MINUTES = 10 * 60 + 1; // 10:01 AM
export const LATE_RETURN_THRESHOLD_MINUTES = 17 * 60; // 5:00 PM

export function clampDuration(minutes: number): number {
  return Math.min(VISIT_DURATION_MAX, Math.max(VISIT_DURATION_MIN, Math.round(minutes)));
}

/** Minutes-since-midnight -> "10:01 AM". */
export function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export interface TimelineStop {
  cardId: string;
  clientId: string;
  stopNumber: number;
  travelMinutes: number;
  arrival: number;
  departure: number;
}

export interface TimelineReturn {
  travelMinutes: number;
  arrival: number;
  isLate: boolean;
}

export interface DayTimeline {
  stops: TimelineStop[];
  returnLeg: TimelineReturn | null;
}

/**
 * Chains travel + on-site duration across a day's ordered visits: depart base
 * at 10:01 AM, accumulate travel time between stops, then estimate the return
 * leg back to base. Ported from the original calcTimes(), adapted to use each
 * card's own `duration` (deterministic) instead of a fixed 30–90 min window.
 */
export function calcDayTimeline(
  cards: { card: VisitCard; client: Client }[],
  trafficOn: boolean,
): DayTimeline {
  const stops: TimelineStop[] = [];
  let clock = WORKDAY_START_MINUTES;
  let prev: Parameters<typeof travelMinutes>[0] = "base";

  for (const { card, client } of cards) {
    const to = { cityKey: client.cityKey, baseTravelMinutes: client.baseTravelMinutes };
    const tr = travelMinutes(prev, to, trafficOn);
    const arrival = clock + tr;
    const departure = arrival + clampDuration(card.duration);
    stops.push({
      cardId: card.id,
      clientId: client.id,
      stopNumber: stops.length + 1,
      travelMinutes: tr,
      arrival,
      departure,
    });
    clock = departure;
    prev = to;
  }

  if (!stops.length) return { stops, returnLeg: null };

  // Original treats base<->client distance as symmetric: the return leg
  // reuses the last client's base travel time rather than a city-pair lookup.
  const lastClient = cards[cards.length - 1].client;
  const returnTravel = applyTraffic(lastClient.baseTravelMinutes, trafficOn);
  const returnArrival = stops[stops.length - 1].departure + returnTravel;

  return {
    stops,
    returnLeg: {
      travelMinutes: returnTravel,
      arrival: returnArrival,
      isLate: returnArrival > LATE_RETURN_THRESHOLD_MINUTES,
    },
  };
}

/** "FV → city1 → city2 → FV", abbreviating long/known names. Ported from route(). */
export function routeSummary(clients: Client[]): string {
  if (!clients.length) return "—";
  const stops = clients
    .map((c) => c.city.replace("Quezon City", "QC").replace(", Bulacan", ""))
    .join(" → ");
  return `FV → ${stops} → FV`;
}

export type SlotLoadLevel = "none" | "near" | "full" | "over";

/** Visual load level for the day's stop-count badge. Ported from renderCol()'s `sc`. */
export function visitLoadLevel(count: number): SlotLoadLevel {
  if (count > MAX_STOPS_PER_DAY) return "over";
  if (count >= MAX_STOPS_PER_DAY) return "full";
  if (count >= MAX_STOPS_PER_DAY - 1) return "near";
  return "none";
}

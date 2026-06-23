import { AppState, Client, Day, VisitCard, Week } from "@/types";
import { cityKey } from "@/lib/travel";
import { DEFAULT_VISIT_DURATION } from "@/lib/timing";
import { formatWeekLabel } from "@/lib/week";

/** Seed week + demo client roster, ported from BASE_C / DEFAULT_WEEK / DEFAULT_BACKLOG in index.html. */
export const DEFAULT_WEEK_ID = "2026-06-01";

interface SeedClient {
  id: string;
  name: string;
  city: string;
  address: string;
  date: string;
  baseTravelMinutes: number;
  priority?: boolean;
}

const SEED_CLIENTS: SeedClient[] = [
  { id: "demo01", name: "Johnny Appleseed", city: "Pasig", address: "Sample Street, Ortigas, Pasig", date: "2026-06-02", baseTravelMinutes: 55 },
  { id: "demo02", name: "Clara Fontaine", city: "Pasig", address: "Placeholder Ave., Kapitolyo, Pasig", date: "2026-06-03", baseTravelMinutes: 55 },
  { id: "demo03", name: "Marco Delgado", city: "Pateros", address: "Demo Road, Pateros", date: "2026-06-04", baseTravelMinutes: 65 },
  { id: "demo04", name: "Priya Venugopal", city: "San Juan", address: "Placeholder St., San Juan City", date: "2026-06-05", baseTravelMinutes: 50 },
  { id: "demo05", name: "Beatrice Nakamura", city: "Quezon City", address: "Demo Blvd., Libis, Quezon City", date: "2026-06-05", baseTravelMinutes: 35, priority: true },
  { id: "demo06", name: "Rafael Okonkwo", city: "Quezon City", address: "Sample Drive, New Manila, Quezon City", date: "2026-06-05", baseTravelMinutes: 30 },
  { id: "demo07", name: "Ingrid Vasquez", city: "Quezon City", address: "Placeholder Road, Quezon City", date: "2026-06-05", baseTravelMinutes: 25 },
  { id: "demo08", name: "Leo Tambayan", city: "Quezon City", address: "Demo Ave., Timog, Quezon City", date: "2026-06-06", baseTravelMinutes: 30 },
  { id: "demo09", name: "Stella Marchetti", city: "Caloocan", address: "Sample Blvd., Caloocan City", date: "2026-06-07", baseTravelMinutes: 25 },
  { id: "demo10", name: "Gus Fairweather", city: "Quezon City", address: "Placeholder St., Tatalon, Quezon City", date: "2026-06-08", baseTravelMinutes: 20 },
  { id: "demo11", name: "Nadia Breckenridge", city: "Quezon City", address: "Demo Street, Quezon City", date: "2026-06-09", baseTravelMinutes: 22 },
  { id: "demo12", name: "Felix Drummond", city: "Quezon City", address: "Sample Road, Sta. Mesa Heights, QC", date: "2026-06-10", baseTravelMinutes: 30 },
  { id: "demo13", name: "Yuki Harrington", city: "Taguig", address: "Placeholder Drive, Taguig City", date: "2026-06-11", baseTravelMinutes: 62 },
  { id: "demo14", name: "Oscar Wentworth", city: "Mandaluyong", address: "Demo Ave., Mandaluyong City", date: "2026-06-12", baseTravelMinutes: 48 },
];

const DEFAULT_PLACEMENTS: Record<Day, string[]> = {
  mon: [],
  tue: ["demo01", "demo02", "demo03"],
  wed: ["demo05", "demo06", "demo07", "demo08"],
  thu: ["demo09", "demo10", "demo11"],
  fri: ["demo13", "demo14", "demo12"],
  sat: [],
  sun: [],
};

function buildClients(): Record<string, Client> {
  const clients: Record<string, Client> = {};
  for (const seed of SEED_CLIENTS) {
    clients[seed.id] = {
      id: seed.id,
      name: seed.name,
      address: seed.address,
      city: seed.city,
      cityKey: cityKey(seed.city),
      notes: "",
      priority: !!seed.priority,
      date: seed.date,
      baseTravelMinutes: seed.baseTravelMinutes,
      createdAt: `${seed.date}T00:00:00.000Z`,
    };
  }
  return clients;
}

function buildDefaultWeek(): Week {
  const visitCards: VisitCard[] = [];
  (Object.keys(DEFAULT_PLACEMENTS) as Day[]).forEach((day) => {
    DEFAULT_PLACEMENTS[day].forEach((clientId, index) => {
      visitCards.push({
        id: `${DEFAULT_WEEK_ID}-${day}-${clientId}`,
        clientId,
        weekId: DEFAULT_WEEK_ID,
        day,
        order: index,
        duration: DEFAULT_VISIT_DURATION,
      });
    });
  });
  return { id: DEFAULT_WEEK_ID, label: formatWeekLabel(DEFAULT_WEEK_ID), visitCards };
}

export function createInitialState(): AppState {
  return {
    clients: buildClients(),
    weeks: { [DEFAULT_WEEK_ID]: buildDefaultWeek() },
    currentWeekId: DEFAULT_WEEK_ID,
    trafficMode: true,
    selectedDayFilters: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    codingOverrides: {},
  };
}

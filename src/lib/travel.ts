/**
 * Travel-time model migrated from the original index.html (CITY_CK, FB_CK, CF, TP).
 * All minute values are calibrated for Metro Manila midday traffic; `applyTraffic`
 * scales them down for the free-flow estimate when traffic mode is off.
 */

// City/municipality display name -> short key used by every other table below.
export const CITY_NAME_TO_KEY: Record<string, string> = {
  // 16 NCR cities + 1 municipality (exact dropdown values)
  Caloocan: "cal",
  "Las Piñas": "lp",
  "Las Pinas": "lp",
  Makati: "mak",
  Malabon: "mlb",
  Mandaluyong: "mnd",
  Manila: "mnl",
  Marikina: "mrk",
  Muntinlupa: "mnt",
  Navotas: "nav",
  Parañaque: "par",
  Paranaque: "par",
  Pasay: "pas",
  Pasig: "psg",
  Pateros: "pat",
  "Quezon City": "qc",
  QC: "qc",
  "San Juan": "sj",
  Taguig: "tag",
  Valenzuela: "val",
  // legacy/alternate spellings kept for import compatibility
  "Caloocan City": "cal",
  "Makati City": "mak",
  "Manila City": "mnl",
  "Pasig City": "psg",
  "Taguig City": "tag",
  // outside NCR — all map to 'oth' (custom field)
  Bulacan: "oth",
  "Pandi, Bulacan": "oth",
  "Meycauayan, Bulacan": "oth",
  "San Jose del Monte, Bulacan": "oth",
};

// Base (Fairview, Quezon City) -> city key, in minutes.
export const BASE_TRAVEL_BY_CITY_KEY: Record<string, number> = {
  qc: 22,
  cal: 25,
  psg: 55,
  pat: 65,
  sj: 45,
  mnl: 52,
  mak: 62,
  par: 68,
  pas: 58,
  tag: 62,
  mnd: 48,
  mrk: 38,
  lp: 75,
  mnt: 78,
  val: 34,
  mlb: 30,
  nav: 28,
  oth: 60,
};

// Cross-city travel fallback (minutes, midday traffic). 'oth' = any outside-NCR location.
export const CROSS_CITY_TRAVEL: Record<string, number> = {
  "qc:qc": 22, "qc:cal": 28, "qc:psg": 42, "qc:pat": 52, "qc:sj": 38, "qc:oth": 62, "qc:mnl": 40, "qc:mak": 52, "qc:par": 68, "qc:pas": 55, "qc:tag": 62, "qc:mnd": 45, "qc:mrk": 35, "qc:lp": 78, "qc:mnt": 80, "qc:val": 34, "qc:mlb": 32, "qc:nav": 30,
  "cal:qc": 28, "cal:cal": 18, "cal:psg": 50, "cal:pat": 60, "cal:sj": 48, "cal:oth": 42, "cal:mnl": 45, "cal:mak": 58, "cal:par": 72, "cal:pas": 60, "cal:tag": 68, "cal:mnd": 50, "cal:mrk": 42, "cal:lp": 82, "cal:mnt": 85, "cal:val": 28, "cal:mlb": 18, "cal:nav": 15,
  "psg:qc": 42, "psg:cal": 50, "psg:psg": 20, "psg:pat": 28, "psg:sj": 22, "psg:oth": 78, "psg:mnl": 35, "psg:mak": 32, "psg:par": 45, "psg:pas": 38, "psg:tag": 35, "psg:mnd": 25, "psg:mrk": 30, "psg:lp": 55, "psg:mnt": 58, "psg:val": 60, "psg:mlb": 58, "psg:nav": 60,
  "pat:qc": 52, "pat:cal": 60, "pat:psg": 28, "pat:pat": 15, "pat:sj": 25, "pat:oth": 85, "pat:mnl": 40, "pat:mak": 38, "pat:par": 50, "pat:pas": 45, "pat:tag": 40, "pat:mnd": 32, "pat:mrk": 38, "pat:lp": 62, "pat:mnt": 65, "pat:val": 68, "pat:mlb": 68, "pat:nav": 70,
  "sj:qc": 38, "sj:cal": 48, "sj:psg": 22, "sj:pat": 25, "sj:sj": 15, "sj:oth": 75, "sj:mnl": 30, "sj:mak": 28, "sj:par": 42, "sj:pas": 35, "sj:tag": 32, "sj:mnd": 20, "sj:mrk": 28, "sj:lp": 52, "sj:mnt": 55, "sj:val": 55, "sj:mlb": 55, "sj:nav": 58,
  "oth:qc": 60, "oth:cal": 42, "oth:psg": 72, "oth:pat": 82, "oth:sj": 72, "oth:oth": 60, "oth:mnl": 70, "oth:mak": 80, "oth:par": 92, "oth:pas": 82, "oth:tag": 88, "oth:mnd": 72, "oth:mrk": 65, "oth:lp": 100, "oth:mnt": 105, "oth:val": 45, "oth:mlb": 45, "oth:nav": 42,
  "mnl:qc": 40, "mnl:cal": 45, "mnl:psg": 35, "mnl:pat": 40, "mnl:sj": 30, "mnl:oth": 70, "mnl:mnl": 20, "mnl:mak": 28, "mnl:par": 42, "mnl:pas": 25, "mnl:tag": 35, "mnl:mnd": 22, "mnl:mrk": 45, "mnl:lp": 52, "mnl:mnt": 55, "mnl:val": 50, "mnl:mlb": 48, "mnl:nav": 50,
  "mak:qc": 52, "mak:cal": 58, "mak:psg": 32, "mak:pat": 38, "mak:sj": 28, "mak:oth": 80, "mak:mnl": 28, "mak:mak": 18, "mak:par": 35, "mak:pas": 22, "mak:tag": 28, "mak:mnd": 25, "mak:mrk": 42, "mak:lp": 45, "mak:mnt": 48, "mak:val": 60, "mak:mlb": 60, "mak:nav": 62,
  "tag:qc": 62, "tag:cal": 68, "tag:psg": 35, "tag:pat": 40, "tag:sj": 32, "tag:oth": 88, "tag:mnl": 35, "tag:mak": 28, "tag:par": 30, "tag:pas": 28, "tag:tag": 15, "tag:mnd": 32, "tag:mrk": 48, "tag:lp": 38, "tag:mnt": 35, "tag:val": 70, "tag:mlb": 72, "tag:nav": 74,
};

// Specific address-pair overrides (minutes, midday traffic). Empty for now —
// reserved for pairs that need a number CROSS_CITY_TRAVEL can't represent.
export const SPECIFIC_PAIR_TRAVEL: Record<string, number> = {};

// Free-flow (no-traffic) scaling factor applied to every midday estimate above.
export const FREE_FLOW_FACTOR = 0.55;
const FREE_FLOW_MIN_MINUTES = 5;

export function cityKey(cityName: string): string {
  return CITY_NAME_TO_KEY[cityName] ?? "oth";
}

export function baseTravelMinutesForCity(key: string): number {
  return BASE_TRAVEL_BY_CITY_KEY[key] ?? 45;
}

/** Scales a midday-traffic minute estimate down to free-flow when traffic mode is off. */
export function applyTraffic(minutes: number, trafficOn: boolean): number {
  return trafficOn ? minutes : Math.max(FREE_FLOW_MIN_MINUTES, Math.round(minutes * FREE_FLOW_FACTOR));
}

export interface TravelPoint {
  cityKey: string;
  baseTravelMinutes: number;
}

/**
 * Travel time in minutes between two stops (or from 'base'), traffic-adjusted.
 * Lookup order mirrors the original: specific pair override > city-pair table >
 * averaged base-travel fallback.
 */
export function travelMinutes(from: TravelPoint | "base", to: TravelPoint, trafficOn: boolean): number {
  if (from === "base") return applyTraffic(to.baseTravelMinutes, trafficOn);

  const pairKey = `${from.cityKey}:${to.cityKey}`;
  if (pairKey in SPECIFIC_PAIR_TRAVEL) return applyTraffic(SPECIFIC_PAIR_TRAVEL[pairKey], trafficOn);
  if (pairKey in CROSS_CITY_TRAVEL) return applyTraffic(CROSS_CITY_TRAVEL[pairKey], trafficOn);

  const fallback = Math.round((from.baseTravelMinutes + to.baseTravelMinutes) * 0.42);
  return applyTraffic(fallback, trafficOn);
}

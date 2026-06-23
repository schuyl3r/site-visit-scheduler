import { AppState, Client, Day, Week } from "@/types";

export const APP_ID = "site-visit-scheduler";
export const DATA_VERSION = 1;

export interface ExportPayload {
  app: typeof APP_ID;
  version: number;
  exportedAt: string;
  clients: Record<string, Client>;
  weeks: Record<string, Week>;
  config: {
    currentWeekId: string;
    trafficMode: boolean;
    selectedDayFilters: Day[];
    codingOverrides: Record<string, boolean>;
  };
}

export function buildExportPayload(state: AppState): ExportPayload {
  return {
    app: APP_ID,
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    clients: state.clients,
    weeks: state.weeks,
    config: {
      currentWeekId: state.currentWeekId,
      trafficMode: state.trafficMode,
      selectedDayFilters: state.selectedDayFilters,
      codingOverrides: state.codingOverrides,
    },
  };
}

export function downloadJSON(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class InvalidBackupError extends Error {}

/**
 * Shape of a parsed backup file. `config` is intentionally optional/partial here
 * (unlike ExportPayload, which is what *we* always produce on export) since an
 * imported file could be hand-edited, truncated, or from an older/future version.
 */
export interface ImportPayload {
  app: string;
  clients: Record<string, Client>;
  weeks: Record<string, Week>;
  config?: Partial<ExportPayload["config"]>;
}

/** Parses + shape-checks a backup file's contents. Throws InvalidBackupError if malformed. */
export function parseImportPayload(raw: string): ImportPayload {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new InvalidBackupError("That file is not valid JSON. Make sure you picked a backup exported from this app.");
  }
  if (
    !data ||
    typeof data !== "object" ||
    (data as Record<string, unknown>).app !== APP_ID ||
    !(data as Record<string, unknown>).clients ||
    !(data as Record<string, unknown>).weeks
  ) {
    throw new InvalidBackupError("This does not look like a Site Visit Scheduler backup file.");
  }
  return data as ImportPayload;
}

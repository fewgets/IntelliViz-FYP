import type { Machine } from "@/types";

export type MaintenanceEntryStatus = "completed" | "scheduled";
export type MaintenanceTimelineStatus = "past" | "present" | "future";

export interface MaintenanceEntry {
  id: string;
  machineId: string;
  machineName: string;
  type: string;
  date: string;
  assignee: string;
  note: string;
  status: MaintenanceEntryStatus;
  source: "machine" | "maintenance";
  createdAt: string;
}

const STORAGE_KEY = "intelliviz-maintenance-events";
const UPDATE_EVENT = "intelliviz-maintenance-events-updated";

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMaintenanceTimelineStatus(
  entry: Pick<MaintenanceEntry, "date" | "status">,
  today = new Date()
): MaintenanceTimelineStatus {
  if (entry.status === "completed") {
    return "past";
  }

  const parsed = parseDate(entry.date);
  if (!parsed) {
    return "future";
  }

  const delta = startOfDay(parsed).getTime() - startOfDay(today).getTime();
  if (delta < 0) return "past";
  if (delta === 0) return "present";
  return "future";
}

export function formatMaintenanceDate(value: string) {
  const parsed = parseDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function getMaintenanceDayKey(value: string) {
  const parsed = parseDate(value);
  return parsed ? startOfDay(parsed).toISOString().slice(0, 10) : value;
}

export function createMaintenanceEntry(input: Omit<MaintenanceEntry, "id" | "createdAt">) {
  return {
    ...input,
    id: `${input.source}-${input.machineId}-${input.date}-${input.type}`,
    createdAt: new Date().toISOString(),
  } satisfies MaintenanceEntry;
}

export function loadMaintenanceEntries() {
  if (typeof window === "undefined") {
    return [] as MaintenanceEntry[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as MaintenanceEntry[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as MaintenanceEntry[];
    }

    return parsed.filter((item): item is MaintenanceEntry => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "machineId" in item &&
          "machineName" in item &&
          "date" in item &&
          "type" in item &&
          "assignee" in item &&
          "note" in item &&
          "status" in item &&
          "source" in item
      );
    });
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [] as MaintenanceEntry[];
  }
}

export function saveMaintenanceEntry(entry: MaintenanceEntry) {
  if (typeof window === "undefined") {
    return;
  }

  const currentEntries = loadMaintenanceEntries();
  const nextEntries = [entry, ...currentEntries.filter((item) => item.id !== entry.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function subscribeMaintenanceEntriesChange(handler: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      handler();
    }
  };

  const customHandler = () => handler();
  window.addEventListener("storage", storageHandler);
  window.addEventListener(UPDATE_EVENT, customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(UPDATE_EVENT, customHandler);
  };
}

export function getMachineMaintenanceEntries(machineId: string) {
  return loadMaintenanceEntries().filter((entry) => entry.machineId === machineId);
}

export function machineToMaintenanceEntry(machine: Machine, date: string, type: string, assignee: string, note: string, source: "machine" | "maintenance") {
  return createMaintenanceEntry({
    machineId: machine.id,
    machineName: machine.name,
    type,
    date,
    assignee,
    note,
    status: "scheduled",
    source,
  });
}
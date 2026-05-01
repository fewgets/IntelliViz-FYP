import { machines } from "@/lib/mock-data";

export const ALL_MACHINE_IDS: string[] = Array.from({ length: 120 }, (_, index) => `M${String(index + 101)}`);

const initiallyAssigned = new Set<string>(machines.map((machine) => machine.id));
const runtimeAssigned = new Set<string>(initiallyAssigned);

export function getAvailableMachineIds(query?: string): string[] {
  const normalizedQuery = (query || "").trim().toLowerCase();

  return ALL_MACHINE_IDS.filter((id) => {
    const available = !runtimeAssigned.has(id);
    if (!available) return false;
    if (!normalizedQuery) return true;
    return id.toLowerCase().includes(normalizedQuery);
  });
}

export function assignMachineId(id: string): { ok: boolean; reason?: "duplicate" | "invalid" } {
  if (!ALL_MACHINE_IDS.includes(id)) return { ok: false, reason: "invalid" };
  if (runtimeAssigned.has(id)) return { ok: false, reason: "duplicate" };

  runtimeAssigned.add(id);
  return { ok: true };
}

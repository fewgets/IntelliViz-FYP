export type MachineType = 'CNC Machine' | 'Pump' | 'Compressor' | 'Robotic Arm';
export type MachineStatus = 'healthy' | 'warning' | 'critical';

export interface Machine {
  id: string;
  name: MachineType;
  status: MachineStatus;
  riskScore: number;
  rul: number; // Remaining Useful Life in days
  efficiency: number; // percentage
  temperature?: number;
  vibration?: number;
  rpm?: number;
  pressure?: number;
}

export interface SensorReading {
  timestamp: number;
  value: number;
}

export const DUMMY_MACHINES: Machine[] = [
  // ── CNC Machines ──
  {
    id: 'cnc-001',
    name: 'CNC Machine',
    status: 'healthy',
    riskScore: 12,
    rul: 52,
    efficiency: 94,
    temperature: 45,
    vibration: 2.1,
    rpm: 3200,
    pressure: 85,
  },
  {
    id: 'cnc-002',
    name: 'CNC Machine',
    status: 'warning',
    riskScore: 38,
    rul: 27,
    efficiency: 82,
    temperature: 58,
    vibration: 3.8,
    rpm: 2900,
    pressure: 78,
  },
  {
    id: 'cnc-003',
    name: 'CNC Machine',
    status: 'critical',
    riskScore: 76,
    rul: 4,
    efficiency: 61,
    temperature: 82,
    vibration: 7.6,
    rpm: 1400,
    pressure: 110,
  },

  // ── Pumps ──
  {
    id: 'pump-001',
    name: 'Pump',
    status: 'warning',
    riskScore: 48,
    rul: 13,
    efficiency: 78,
    temperature: 68,
    vibration: 4.5,
    rpm: 1800,
    pressure: 42,
  },
  {
    id: 'pump-002',
    name: 'Pump',
    status: 'healthy',
    riskScore: 10,
    rul: 63,
    efficiency: 96,
    temperature: 40,
    vibration: 1.8,
    rpm: 2100,
    pressure: 55,
  },
  {
    id: 'pump-003',
    name: 'Pump',
    status: 'critical',
    riskScore: 85,
    rul: 2,
    efficiency: 54,
    temperature: 90,
    vibration: 9.1,
    rpm: 800,
    pressure: 130,
  },

  // ── Compressors ──
  {
    id: 'compressor-001',
    name: 'Compressor',
    status: 'healthy',
    riskScore: 18,
    rul: 41,
    efficiency: 91,
    temperature: 52,
    vibration: 3.2,
    rpm: 2400,
    pressure: 95,
  },
  {
    id: 'compressor-002',
    name: 'Compressor',
    status: 'warning',
    riskScore: 42,
    rul: 17,
    efficiency: 74,
    temperature: 63,
    vibration: 5.0,
    rpm: 2000,
    pressure: 88,
  },
  {
    id: 'compressor-003',
    name: 'Compressor',
    status: 'healthy',
    riskScore: 8,
    rul: 67,
    efficiency: 97,
    temperature: 38,
    vibration: 1.5,
    rpm: 2600,
    pressure: 92,
  },

  // ── Robotic Arms ──
  {
    id: 'robotic-arm-001',
    name: 'Robotic Arm',
    status: 'critical',
    riskScore: 82,
    rul: 2,
    efficiency: 62,
    temperature: 85,
    vibration: 8.3,
    rpm: 600,
    pressure: 120,
  },
  {
    id: 'robotic-arm-002',
    name: 'Robotic Arm',
    status: 'healthy',
    riskScore: 15,
    rul: 46,
    efficiency: 90,
    temperature: 42,
    vibration: 2.4,
    rpm: 3000,
    pressure: 70,
  },
  {
    id: 'robotic-arm-003',
    name: 'Robotic Arm',
    status: 'warning',
    riskScore: 55,
    rul: 9,
    efficiency: 71,
    temperature: 72,
    vibration: 5.8,
    rpm: 1600,
    pressure: 105,
  },
];

/** Get all machines of the same type as the given machine */
export function getMachinesByType(type: MachineType): Machine[] {
  return DUMMY_MACHINES.filter((m) => m.name === type);
}

/** Find a single machine by its ID */
export function getMachineById(id: string): Machine | undefined {
  return DUMMY_MACHINES.find((m) => m.id === id);
}

/** Get one representative machine per type (for the overview page) */
export function getRepresentativeMachines(): Machine[] {
  const seen = new Set<MachineType>();
  return DUMMY_MACHINES.filter((m) => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}

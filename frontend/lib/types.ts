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
  // CNC
  { id: 'cnc-001', name: 'CNC Machine', status: 'healthy', riskScore: 12, rul: 52, efficiency: 94 },
  { id: 'cnc-002', name: 'CNC Machine', status: 'healthy', riskScore: 15, rul: 48, efficiency: 96 },
  { id: 'cnc-003', name: 'CNC Machine', status: 'warning', riskScore: 45, rul: 24, efficiency: 78 },
  { id: 'cnc-004', name: 'CNC Machine', status: 'critical', riskScore: 88, rul: 5, efficiency: 52 },
  { id: 'cnc-005', name: 'CNC Machine', status: 'healthy', riskScore: 20, rul: 40, efficiency: 92 },
  // Pump
  { id: 'pump-006', name: 'Pump', status: 'healthy', riskScore: 10, rul: 60, efficiency: 95 },
  { id: 'pump-007', name: 'Pump', status: 'critical', riskScore: 92, rul: 2, efficiency: 48 },
  { id: 'pump-008', name: 'Pump', status: 'warning', riskScore: 40, rul: 28, efficiency: 82 },
  { id: 'pump-009', name: 'Pump', status: 'healthy', riskScore: 18, rul: 45, efficiency: 91 },
  { id: 'pump-010', name: 'Pump', status: 'critical', riskScore: 85, rul: 4, efficiency: 58 },
  // Compressor
  { id: 'comp-011', name: 'Compressor', status: 'critical', riskScore: 95, rul: 1, efficiency: 42 },
  { id: 'comp-012', name: 'Compressor', status: 'warning', riskScore: 50, rul: 18, efficiency: 76 },
  { id: 'comp-013', name: 'Compressor', status: 'critical', riskScore: 82, rul: 6, efficiency: 55 },
  { id: 'comp-014', name: 'Compressor', status: 'healthy', riskScore: 14, rul: 55, efficiency: 93 },
  { id: 'comp-015', name: 'Compressor', status: 'warning', riskScore: 42, rul: 25, efficiency: 80 },
  // Robotic Arm
  { id: 'robo-016', name: 'Robotic Arm', status: 'healthy', riskScore: 11, rul: 58, efficiency: 94 },
  { id: 'robo-017', name: 'Robotic Arm', status: 'warning', riskScore: 55, rul: 15, efficiency: 74 },
  { id: 'robo-018', name: 'Robotic Arm', status: 'healthy', riskScore: 25, rul: 35, efficiency: 89 },
  { id: 'robo-019', name: 'Robotic Arm', status: 'critical', riskScore: 89, rul: 3, efficiency: 45 },
  { id: 'robo-020', name: 'Robotic Arm', status: 'critical', riskScore: 78, rul: 8, efficiency: 60 },
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

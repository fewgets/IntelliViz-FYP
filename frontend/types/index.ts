// Machine types
export type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline';

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  sensors: MachineSensor[];
  efficiency: number;
  uptime: number;
}

export interface MachineSensor {
  id: string;
  name: string;
  type: 'temperature' | 'vibration' | 'pressure' | 'power' | 'rpm';
  value: number;
  unit: string;
  min: number;
  max: number;
  threshold: {
    warning: number;
    critical: number;
  };
  history: SensorReading[];
}

export interface SensorReading {
  timestamp: string;
  value: number;
}

// Alert types
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AIResultPayload {
  predictionType: string;
  riskScore: number;
  confidence: number;
  alertLevel: AlertSeverity;
  rootCause: string;
  aiRecommendation: string;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  suggestedAction?: string;
  aiResult?: AIResultPayload;
}

// Analytics types
export interface DashboardSummary {
  totalMachines: number;
  activeMachines: number;
  faultyMachines: number;
  productionEfficiency: number;
  energyConsumption: number;
  systemHealth: number;
}

export interface AnomalyData {
  timestamp: string;
  value: number;
  predicted: number;
  isAnomaly: boolean;
  machineId?: string;
  aiResult?: AIResultPayload;
}

export interface EnergyData {
  timestamp: string;
  consumption: number;
  peak: number;
  average: number;
}

export interface ProductionKPI {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  outputPerHour: number;
  downtime: number;
  target: number;
}

// Cybersecurity types
export interface SecurityAlert {
  id: string;
  type: 'intrusion' | 'authentication' | 'network' | 'malware';
  severity: AlertSeverity;
  source: string;
  destination: string;
  timestamp: string;
  description: string;
  blocked: boolean;
}

export interface NetworkActivity {
  timestamp: string;
  inbound: number;
  outbound: number;
  suspicious: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  avatar?: string;
}

// Settings types
export interface AlertConfig {
  machineId: string;
  thresholds: {
    temperature: { warning: number; critical: number };
    vibration: { warning: number; critical: number };
    pressure: { warning: number; critical: number };
  };
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
}

export interface ThemeConfig {
  primary: string;
  warning: string;
  critical: string;
  mode: 'light' | 'dark' | 'system';
}

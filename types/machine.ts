export type SensorType = "temperature" | "vibration" | "power" | "pressure";

export type NotificationChannel = "email" | "sms" | "whatsapp";

export interface AvailableMachineId {
  id: string;
  available: boolean;
}

export interface MachineConfig {
  predictive: boolean;
  cybersecurity: boolean;
  energy: boolean;
}

export interface MachineThresholds {
  temperature: number;
  vibration: number;
  power: number;
}

export interface MachineAlerts {
  enabled: boolean;
  severities: {
    warning: boolean;
    critical: boolean;
  };
  channels: NotificationChannel[];
}

export interface AddMachinePayload {
  machine_id: string;
  name: string;
  type: string;
  location: string;
  sensors: SensorType[];
  config: MachineConfig;
  thresholds: MachineThresholds;
  alerts: MachineAlerts;
}

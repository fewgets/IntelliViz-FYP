import type { NotificationChannel, SensorType } from "@/types/machine";

export const MACHINE_TYPES = [
  "CNC Machine",
  "Pump",
  "Robotic Arm",
  "Compressor",
] as const;

export const SENSOR_OPTIONS: Array<{ label: string; value: SensorType }> = [
  { label: "Temperature", value: "temperature" },
  { label: "Vibration", value: "vibration" },
  { label: "Power", value: "power" },
  { label: "Pressure", value: "pressure" },
];

export const CHANNEL_OPTIONS: Array<{ label: string; value: NotificationChannel }> = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "WhatsApp (webhook)", value: "whatsapp" },
];

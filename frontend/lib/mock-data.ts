import type { 
  Machine, 
  MachineStatus,
  Alert, 
  DashboardSummary, 
  AnomalyData, 
  EnergyData, 
  ProductionKPI,
  SecurityAlert,
  NetworkActivity 
} from '@/types';

const DATASET_BASE_TIME = new Date('2026-04-14T12:00:00Z');

function hashSeed(seed: string) {
  let value = 2166136261;

  for (let index = 0; index < seed.length; index++) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }

  return value >>> 0;
}

function createRandom(seed: string) {
  let state = hashSeed(seed) || 1;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

// Generate time series data
function generateTimeSeriesData(hours: number, baseValue: number, variance: number) {
  const random = createRandom(`${hours}-${baseValue}-${variance}`);
  const data = [];
  const now = DATASET_BASE_TIME;
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = baseValue + (random() - 0.5) * variance;
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 10) / 10,
    });
  }
  return data;
}

// Dashboard Summary
export const dashboardSummary: DashboardSummary = {
  totalMachines: 24,
  activeMachines: 21,
  faultyMachines: 2,
  productionEfficiency: 87.5,
  energyConsumption: 1245.8,
  systemHealth: 92,
};

// Machines
const coreMachines: Machine[] = [
  {
    id: 'MCH-001',
    name: 'CNC Mill Alpha',
    type: 'CNC Machine',
    location: 'Building A - Floor 1',
    status: 'operational',
    lastMaintenance: '2026-03-15',
    nextMaintenance: '2026-04-15',
    efficiency: 94,
    uptime: 98.5,
    sensors: [
      {
        id: 'SEN-001',
        name: 'Spindle Temperature',
        type: 'temperature',
        value: 62,
        unit: '°C',
        min: 20,
        max: 100,
        threshold: { warning: 75, critical: 90 },
        history: generateTimeSeriesData(24, 60, 10),
      },
      {
        id: 'SEN-002',
        name: 'Vibration Level',
        type: 'vibration',
        value: 2.4,
        unit: 'mm/s',
        min: 0,
        max: 10,
        threshold: { warning: 5, critical: 8 },
        history: generateTimeSeriesData(24, 2.5, 1),
      },
      {
        id: 'SEN-003',
        name: 'Power Draw',
        type: 'power',
        value: 45,
        unit: 'kW',
        min: 0,
        max: 100,
        threshold: { warning: 80, critical: 95 },
        history: generateTimeSeriesData(24, 45, 15),
      },
    ],
  },
  {
    id: 'MCH-002',
    name: 'Water Pump Beta',
    type: 'Pump',
    location: 'Building A - Floor 1',
    status: 'warning',
    lastMaintenance: '2026-02-28',
    nextMaintenance: '2026-04-01',
    efficiency: 78,
    uptime: 89.2,
    sensors: [
      {
        id: 'SEN-004',
        name: 'Hydraulic Pressure',
        type: 'pressure',
        value: 185,
        unit: 'bar',
        min: 0,
        max: 250,
        threshold: { warning: 200, critical: 230 },
        history: generateTimeSeriesData(24, 180, 20),
      },
      {
        id: 'SEN-005',
        name: 'Oil Temperature',
        type: 'temperature',
        value: 78,
        unit: '°C',
        min: 20,
        max: 120,
        threshold: { warning: 85, critical: 100 },
        history: generateTimeSeriesData(24, 75, 12),
      },
    ],
  },
  {
    id: 'MCH-003',
    name: 'Assembly Robot Gamma',
    type: 'Robotic Arm',
    location: 'Building B - Floor 2',
    status: 'operational',
    lastMaintenance: '2026-03-20',
    nextMaintenance: '2026-05-20',
    efficiency: 96,
    uptime: 99.1,
    sensors: [
      {
        id: 'SEN-006',
        name: 'Joint Temperature',
        type: 'temperature',
        value: 45,
        unit: '°C',
        min: 15,
        max: 80,
        threshold: { warning: 60, critical: 75 },
        history: generateTimeSeriesData(24, 44, 8),
      },
      {
        id: 'SEN-007',
        name: 'Motor RPM',
        type: 'rpm',
        value: 1450,
        unit: 'RPM',
        min: 0,
        max: 3000,
        threshold: { warning: 2500, critical: 2800 },
        history: generateTimeSeriesData(24, 1450, 200),
      },
    ],
  },
  {
    id: 'MCH-004',
    name: 'Air Compressor Delta',
    type: 'Compressor',
    location: 'Building B - Floor 1',
    status: 'critical',
    lastMaintenance: '2026-01-10',
    nextMaintenance: '2026-02-10',
    efficiency: 45,
    uptime: 72.3,
    sensors: [
      {
        id: 'SEN-008',
        name: 'Belt Temperature',
        type: 'temperature',
        value: 92,
        unit: '°C',
        min: 20,
        max: 100,
        threshold: { warning: 70, critical: 85 },
        history: generateTimeSeriesData(24, 88, 8),
      },
      {
        id: 'SEN-009',
        name: 'Motor Vibration',
        type: 'vibration',
        value: 7.8,
        unit: 'mm/s',
        min: 0,
        max: 10,
        threshold: { warning: 5, critical: 7 },
        history: generateTimeSeriesData(24, 7.2, 1.5),
      },
    ],
  },
  {
    id: 'MCH-005',
    name: 'CNC Lathe Epsilon',
    type: 'CNC Machine',
    location: 'Building C - Floor 1',
    status: 'operational',
    lastMaintenance: '2026-03-25',
    nextMaintenance: '2026-05-25',
    efficiency: 91,
    uptime: 97.8,
    sensors: [
      {
        id: 'SEN-010',
        name: 'Barrel Temperature',
        type: 'temperature',
        value: 215,
        unit: '°C',
        min: 150,
        max: 300,
        threshold: { warning: 260, critical: 280 },
        history: generateTimeSeriesData(24, 215, 15),
      },
      {
        id: 'SEN-011',
        name: 'Injection Pressure',
        type: 'pressure',
        value: 120,
        unit: 'MPa',
        min: 0,
        max: 200,
        threshold: { warning: 160, critical: 180 },
        history: generateTimeSeriesData(24, 120, 20),
      },
    ],
  },
  {
    id: 'MCH-006',
    name: 'Coolant Pump Zeta',
    type: 'Pump',
    location: 'Building A - Floor 2',
    status: 'operational',
    lastMaintenance: '2026-04-01',
    nextMaintenance: '2026-06-01',
    efficiency: 89,
    uptime: 95.6,
    sensors: [
      {
        id: 'SEN-012',
        name: 'Laser Power',
        type: 'power',
        value: 3.2,
        unit: 'kW',
        min: 0,
        max: 5,
        threshold: { warning: 4, critical: 4.5 },
        history: generateTimeSeriesData(24, 3.2, 0.5),
      },
    ],
  },
];

const additionalMachineSeed: Array<{
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  efficiency: number;
  uptime: number;
}> = [
  { name: 'CNC Router Eta', type: 'CNC Machine', location: 'Building C - Floor 2', status: 'operational', efficiency: 88, uptime: 94.2 },
  { name: 'CNC Mill Theta', type: 'CNC Machine', location: 'Building D - Floor 1', status: 'warning', efficiency: 76, uptime: 87.1 },
  { name: 'CNC Lathe Iota', type: 'CNC Machine', location: 'Building D - Floor 2', status: 'operational', efficiency: 90, uptime: 96.4 },
  { name: 'CNC Plasma Kappa', type: 'CNC Machine', location: 'Building A - Floor 3', status: 'critical', efficiency: 61, uptime: 79.5 },
  { name: 'Centrifugal Pump Lambda', type: 'Pump', location: 'Building B - Floor 3', status: 'operational', efficiency: 93, uptime: 97.2 },
  { name: 'Submersible Pump Mu', type: 'Pump', location: 'Utilities Block', status: 'warning', efficiency: 74, uptime: 85.9 },
  { name: 'Diaphragm Pump Nu', type: 'Pump', location: 'Utilities Block', status: 'operational', efficiency: 87, uptime: 95.1 },
  { name: 'Gear Pump Xi', type: 'Pump', location: 'Building E - Floor 1', status: 'operational', efficiency: 89, uptime: 93.6 },
  { name: 'Welding Robot Omicron', type: 'Robotic Arm', location: 'Building C - Floor 1', status: 'offline', efficiency: 0, uptime: 0 },
  { name: 'Palletizing Robot Pi', type: 'Robotic Arm', location: 'Warehouse Dock', status: 'operational', efficiency: 92, uptime: 98.1 },
  { name: 'Air Compressor Rho', type: 'Compressor', location: 'Utilities Block', status: 'warning', efficiency: 71, uptime: 84.7 },
  { name: 'Robotic Arm Sigma', type: 'Robotic Arm', location: 'Building F - Floor 1', status: 'operational', efficiency: 86, uptime: 92.3 },
  { name: 'Pick-and-Place Tau', type: 'Robotic Arm', location: 'Building B - Floor 2', status: 'operational', efficiency: 95, uptime: 98.8 },
  { name: 'Assembly Robot Upsilon', type: 'Robotic Arm', location: 'Building A - Floor 2', status: 'operational', efficiency: 91, uptime: 96.9 },
  { name: 'Rotary Compressor Phi', type: 'Compressor', location: 'Building C - Floor 2', status: 'operational', efficiency: 91, uptime: 96.9 },
  { name: 'Scroll Compressor Chi', type: 'Compressor', location: 'Utilities Block', status: 'operational', efficiency: 88, uptime: 94.5 },
  { name: 'Reciprocating Psi', type: 'Compressor', location: 'Utilities Block', status: 'warning', efficiency: 77, uptime: 88.2 },
  { name: 'Axial Compressor Omega', type: 'Compressor', location: 'Building E - Floor 2', status: 'operational', efficiency: 94, uptime: 97.8 },
];

const additionalMachines: Machine[] = additionalMachineSeed.map((seed, index) => {
  const machineNumber = index + 7;
  const machineId = `MCH-${String(machineNumber).padStart(3, '0')}`;
  const sensorStart = 13 + index * 2;
  const tempBase = 40 + (index % 7) * 5;
  const powerBase = 30 + (index % 8) * 6;
  const dayOffset = String(3 + (index % 20)).padStart(2, '0');

  return {
    id: machineId,
    name: seed.name,
    type: seed.type,
    location: seed.location,
    status: seed.status,
    lastMaintenance: `2026-03-${dayOffset}`,
    nextMaintenance: `2026-05-${dayOffset}`,
    efficiency: seed.efficiency,
    uptime: seed.uptime,
    sensors: [
      {
        id: `SEN-${String(sensorStart).padStart(3, '0')}`,
        name: 'Temperature',
        type: 'temperature',
        value: seed.status === 'offline' ? 0 : tempBase,
        unit: '°C',
        min: 0,
        max: 120,
        threshold: { warning: 80, critical: 95 },
        history: generateTimeSeriesData(24, seed.status === 'offline' ? 5 : tempBase, 10),
      },
      {
        id: `SEN-${String(sensorStart + 1).padStart(3, '0')}`,
        name: 'Power Draw',
        type: 'power',
        value: seed.status === 'offline' ? 0 : powerBase,
        unit: 'kW',
        min: 0,
        max: 120,
        threshold: { warning: 95, critical: 110 },
        history: generateTimeSeriesData(24, seed.status === 'offline' ? 2 : powerBase, 14),
      },
    ],
  };
});

export const machines: Machine[] = [...coreMachines, ...additionalMachines];

// Alerts
export const alerts: Alert[] = [
  {
    id: 'ALT-001',
    machineId: 'MCH-004',
    machineName: 'Air Compressor Delta',
    severity: 'critical',
    title: 'Critical Temperature Exceeded',
    message: 'Belt temperature has exceeded critical threshold of 85°C. Current reading: 92°C',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 5 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Immediately reduce load or shut down for cooling. Check belt alignment and lubrication.',
  },
  {
    id: 'ALT-002',
    machineId: 'MCH-004',
    machineName: 'Air Compressor Delta',
    severity: 'critical',
    title: 'Excessive Vibration Detected',
    message: 'Motor vibration at 7.8 mm/s exceeds critical threshold of 7 mm/s',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 12 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Check motor bearings and belt tension. Schedule immediate maintenance.',
  },
  {
    id: 'ALT-003',
    machineId: 'MCH-002',
    machineName: 'Water Pump Beta',
    severity: 'warning',
    title: 'Oil Temperature Rising',
    message: 'Hydraulic oil temperature approaching warning threshold. Current: 78°C, Warning: 85°C',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 25 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Monitor closely. Consider reducing cycle rate or checking cooling system.',
  },
  {
    id: 'ALT-004',
    machineId: 'MCH-002',
    machineName: 'Water Pump Beta',
    severity: 'info',
    title: 'Maintenance Due Soon',
    message: 'Scheduled maintenance due on 2026-04-01. 3 days remaining.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Schedule maintenance appointment and prepare replacement parts.',
  },
  {
    id: 'ALT-005',
    machineId: 'MCH-001',
    machineName: 'CNC Mill Alpha',
    severity: 'info',
    title: 'Efficiency Optimization Available',
    message: 'AI analysis suggests toolpath optimization could improve efficiency by 3%.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Review AI-generated toolpath suggestions in machine details.',
  },
  {
    id: 'ALT-006',
    machineId: 'MCH-008',
    machineName: 'CNC Mill Theta',
    severity: 'warning',
    title: 'Torque Fluctuation Detected',
    message: 'Mixer torque shows unstable spikes beyond warning band for the last 20 minutes.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 6 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Inspect agitator load and verify motor coupling alignment.',
  },
  {
    id: 'ALT-007',
    machineId: 'MCH-010',
    machineName: 'CNC Plasma Kappa',
    severity: 'critical',
    title: 'Hydraulic Pressure Drop',
    message: 'Pressure dropped below safe operating baseline during active cycle.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 14 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Pause stamping cycle and inspect hydraulic circuit for leaks.',
  },
  {
    id: 'ALT-008',
    machineId: 'MCH-011',
    machineName: 'Centrifugal Pump Lambda',
    severity: 'info',
    title: 'Arc Stability Recalibration Suggested',
    message: 'Model recommends minor arc profile tuning for consistency improvement.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 18 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Apply suggested calibration profile in next idle window.',
  },
  {
    id: 'ALT-009',
    machineId: 'MCH-012',
    machineName: 'Submersible Pump Mu',
    severity: 'warning',
    title: 'Steam Temperature Drift',
    message: 'Steam outlet temperature remains 6°C above rolling average.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 31 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Check control valve response and verify thermal sensor calibration.',
  },
  {
    id: 'ALT-010',
    machineId: 'MCH-013',
    machineName: 'Diaphragm Pump Nu',
    severity: 'info',
    title: 'Fan Speed Optimization Available',
    message: 'Energy model suggests fan speed adjustment for 4% savings.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 42 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Apply recommended fan schedule during low-load hours.',
  },
  {
    id: 'ALT-011',
    machineId: 'MCH-014',
    machineName: 'Gear Pump Xi',
    severity: 'warning',
    title: 'Pressure Oscillation Pattern',
    message: 'Periodic pressure oscillation detected during agitation phase.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 55 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Inspect pressure regulator and review process recipe ramp rates.',
  },
  {
    id: 'ALT-012',
    machineId: 'MCH-015',
    machineName: 'Welding Robot Omicron',
    severity: 'critical',
    title: 'Line Offline Unexpectedly',
    message: 'Sorting line stopped without planned downtime event.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 68 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Check PLC fault log and restore conveyor drive power stage.',
  },
  {
    id: 'ALT-013',
    machineId: 'MCH-016',
    machineName: 'Palletizing Robot Pi',
    severity: 'info',
    title: 'Cycle Time Improvement Opportunity',
    message: 'Pathing optimization can reduce pallet cycle by 2.1 seconds.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 86 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Review motion profile and validate in simulation mode.',
  },
  {
    id: 'ALT-014',
    machineId: 'MCH-017',
    machineName: 'Air Compressor Rho',
    severity: 'warning',
    title: 'Air Leak Suspected',
    message: 'Compressor runtime increased while line demand remained constant.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 102 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Inspect pneumatic network for leaks near manifold zone B.',
  },
  {
    id: 'ALT-015',
    machineId: 'MCH-018',
    machineName: 'Robotic Arm Sigma',
    severity: 'critical',
    title: 'Heat Zone Overshoot',
    message: 'Primary heating zone exceeded critical band by 18°C.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 125 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Reduce burner output and run thermal safety inspection.',
  },
  {
    id: 'ALT-016',
    machineId: 'MCH-019',
    machineName: 'Pick-and-Place Tau',
    severity: 'info',
    title: 'Lens Cleaning Reminder',
    message: 'Vision model confidence dropped 3% due to lens contamination trend.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 152 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Clean lens module and run calibration target sequence.',
  },
  {
    id: 'ALT-017',
    machineId: 'MCH-020',
    machineName: 'Assembly Robot Upsilon',
    severity: 'warning',
    title: 'Bolt Torque Variance',
    message: 'Fastening torque variance crossed warning threshold on 8 units.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 178 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Check torque driver calibration and feeder alignment.',
  },
  {
    id: 'ALT-018',
    machineId: 'MCH-007',
    machineName: 'CNC Router Eta',
    severity: 'info',
    title: 'Minor Throughput Dip',
    message: 'Throughput dipped 4% for one short interval; recovered automatically.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 220 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'No immediate action required, continue monitoring.',
  },
  {
    id: 'ALT-019',
    machineId: 'MCH-003',
    machineName: 'Assembly Robot Gamma',
    severity: 'warning',
    title: 'Joint Temperature Drift',
    message: 'Joint-2 temperature trend is rising faster than baseline model.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 265 * 60 * 1000).toISOString(),
    acknowledged: false,
    suggestedAction: 'Verify lubrication cycle and inspect coolant path.',
  },
  {
    id: 'ALT-020',
    machineId: 'MCH-006',
    machineName: 'Coolant Pump Zeta',
    severity: 'info',
    title: 'Beam Alignment Check Recommended',
    message: 'Predictive model suggests preventive alignment within 48 hours.',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 310 * 60 * 1000).toISOString(),
    acknowledged: true,
    suggestedAction: 'Run standard optical alignment and confirm focus offset.',
  },
];

// Anomaly Data
export function generateAnomalyData(): AnomalyData[] {
  const data: AnomalyData[] = [];
  const now = DATASET_BASE_TIME;
  const random = createRandom('anomaly-data');

  const totalHours = 365 * 24;
  const stepHours = 2;

  for (let i = totalHours; i >= 0; i -= stepHours) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseValue = 50 + Math.sin(i / 24 * Math.PI) * 10;
    const value = baseValue + (random() - 0.5) * 8;
    const predicted = baseValue + (random() - 0.5) * 2;
    const isAnomaly = random() < 0.035 && i > 12;
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: isAnomaly ? value + (random() > 0.5 ? 25 : -20) : value,
      predicted: Math.round(predicted * 10) / 10,
      isAnomaly,
    });
  }
  
  return data;
}

// Energy Data
export function generateEnergyData(): EnergyData[] {
  const data: EnergyData[] = [];
  const now = DATASET_BASE_TIME;
  const random = createRandom('energy-data');
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const baseConsumption = hour >= 8 && hour <= 18 ? 1200 : 400;
    const consumption = baseConsumption + (random() - 0.5) * 200;
    
    data.push({
      timestamp: timestamp.toISOString(),
      consumption: Math.round(consumption),
      peak: Math.round(consumption * 1.3),
      average: Math.round(baseConsumption * 0.85),
    });
  }
  
  return data;
}

// Production KPIs
export const productionKPI: ProductionKPI = {
  oee: 85.2,
  availability: 92.1,
  performance: 94.3,
  quality: 98.2,
  outputPerHour: 142,
  downtime: 47,
  target: 150,
};

// Security Alerts
export const securityAlerts: SecurityAlert[] = [
  {
    id: 'SEC-001',
    type: 'intrusion',
    severity: 'critical',
    source: '192.168.1.105',
    destination: '10.0.0.15',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 15 * 60 * 1000).toISOString(),
    description: 'Unauthorized access attempt detected on PLC controller',
    blocked: true,
  },
  {
    id: 'SEC-002',
    type: 'authentication',
    severity: 'warning',
    source: '192.168.1.89',
    destination: '10.0.0.1',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 45 * 60 * 1000).toISOString(),
    description: 'Multiple failed login attempts from unknown device',
    blocked: false,
  },
  {
    id: 'SEC-003',
    type: 'network',
    severity: 'info',
    source: '192.168.1.200',
    destination: 'External',
    timestamp: new Date(DATASET_BASE_TIME.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Unusual outbound traffic pattern detected',
    blocked: false,
  },
];

// Network Activity
export function generateNetworkActivity(): NetworkActivity[] {
  const data: NetworkActivity[] = [];
  const now = DATASET_BASE_TIME;
  const random = createRandom('network-activity');
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const baseTraffic = hour >= 8 && hour <= 18 ? 800 : 200;
    
    data.push({
      timestamp: timestamp.toISOString(),
      inbound: Math.round(baseTraffic + (random() - 0.5) * 200),
      outbound: Math.round(baseTraffic * 0.6 + (random() - 0.5) * 100),
      suspicious: Math.round(random() * 15),
    });
  }
  
  return data;
}

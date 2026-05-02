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
  totalMachines: 20,
  activeMachines: 18,
  faultyMachines: 2,
  productionEfficiency: 87.5,
  energyConsumption: 1245.8,
  systemHealth: 88,
};

// Custom Machine Dataset based on provided data
const machineDataSpec = [
  // CNC
  { id: '1', type: 'CNC Machine', name: 'CNC Alpha', status: 'operational', eff: 94 },
  { id: '2', type: 'CNC Machine', name: 'CNC Beta', status: 'operational', eff: 96 },
  { id: '3', type: 'CNC Machine', name: 'CNC Gamma', status: 'warning', eff: 78 },
  { id: '4', type: 'CNC Machine', name: 'CNC Delta', status: 'critical', eff: 52 },
  { id: '5', type: 'CNC Machine', name: 'CNC Epsilon', status: 'operational', eff: 92 },
  // Pump
  { id: '6', type: 'Pump', name: 'Pump Zeta', status: 'operational', eff: 95 },
  { id: '7', type: 'Pump', name: 'Pump Eta', status: 'critical', eff: 48 },
  { id: '8', type: 'Pump', name: 'Pump Theta', status: 'warning', eff: 82 },
  { id: '9', type: 'Pump', name: 'Pump Iota', status: 'operational', eff: 91 },
  { id: '10', type: 'Pump', name: 'Pump Kappa', status: 'critical', eff: 58 },
  // Compressor
  { id: '11', type: 'Compressor', name: 'Compressor Lambda', status: 'critical', eff: 42 },
  { id: '12', type: 'Compressor', name: 'Compressor Mu', status: 'warning', eff: 76 },
  { id: '13', type: 'Compressor', name: 'Compressor Nu', status: 'critical', eff: 55 },
  { id: '14', type: 'Compressor', name: 'Compressor Xi', status: 'operational', eff: 93 },
  { id: '15', type: 'Compressor', name: 'Compressor Omicron', status: 'warning', eff: 80 },
  // Robotic Arm
  { id: '16', type: 'Robotic Arm', name: 'Robotic Arm Pi', status: 'operational', eff: 94 },
  { id: '17', type: 'Robotic Arm', name: 'Robotic Arm Rho', status: 'warning', eff: 74 },
  { id: '18', type: 'Robotic Arm', name: 'Robotic Arm Sigma', status: 'operational', eff: 89 },
  { id: '19', type: 'Robotic Arm', name: 'Robotic Arm Tau', status: 'critical', eff: 45 },
  { id: '20', type: 'Robotic Arm', name: 'Robotic Arm Upsilon', status: 'critical', eff: 60 },
] as const;

export const machines: Machine[] = machineDataSpec.map((spec, index) => {
  const machineId = `MCH-${spec.id.padStart(3, '0')}`;
  const sensorStart = 1 + index * 2;

  // Base configurations by machine type
  let vibBase = 1.5, vibVar = 0.5, vibWarn = 5, vibCrit = 8, vibMax = 15;
  let tempBase = 50, tempVar = 10, tempWarn = 80, tempCrit = 90, tempMax = 120;
  let currBase = 10, currVar = 3, currWarn = 25, currCrit = 32, currMax = 40;
  let pressBase = 60, pressVar = 10, pressWarn = 140, pressCrit = 180, pressMax = 220;
  let rpmBase = 1200, rpmVar = 200, rpmWarn = 3000, rpmCrit = 3800, rpmMax = 4500;
  let ambBase = 13.0, ambVar = 2, ambWarn = 18, ambCrit = 22, ambMax = 30;
  let maintBase = 166;

  if (spec.type === 'CNC Machine') {
    vibBase = 2.05; vibWarn = 6.0; vibCrit = 8.5; vibMax = 12;
    tempBase = 54.75; tempWarn = 80; tempCrit = 90; tempMax = 110;
    currBase = 10.16; currWarn = 28; currCrit = 32; currMax = 40;
    pressBase = 51.22; pressWarn = 110; pressCrit = 130; pressMax = 160;
    rpmBase = 2046; rpmWarn = 3600; rpmCrit = 3900; rpmMax = 4500;
  } else if (spec.type === 'Pump') {
    vibBase = 1.51; vibWarn = 5.0; vibCrit = 6.0; vibMax = 10;
    tempBase = 53.10; tempWarn = 80; tempCrit = 90; tempMax = 110;
    currBase = 9.14; currWarn = 25; currCrit = 28; currMax = 35;
    pressBase = 69.56; pressWarn = 140; pressCrit = 155; pressMax = 180;
    rpmBase = 963; rpmWarn = 1600; rpmCrit = 1800; rpmMax = 2200;
  } else if (spec.type === 'Compressor') {
    vibBase = 2.03; vibWarn = 7.0; vibCrit = 9.0; vibMax = 12;
    tempBase = 57.36; tempWarn = 82; tempCrit = 92; tempMax = 110;
    currBase = 11.51; currWarn = 28; currCrit = 33; currMax = 40;
    pressBase = 82.63; pressWarn = 180; pressCrit = 195; pressMax = 230;
    rpmBase = 1313; rpmWarn = 2200; rpmCrit = 2400; rpmMax = 2800;
  } else if (spec.type === 'Robotic Arm') {
    vibBase = 0.91; vibWarn = 4.5; vibCrit = 5.8; vibMax = 8;
    tempBase = 40.43; tempWarn = 75; tempCrit = 83; tempMax = 100;
    currBase = 4.50; currWarn = 11; currCrit = 13; currMax = 18;
    pressBase = 32.34; pressWarn = 65; pressCrit = 75; pressMax = 100;
    rpmBase = 269; rpmWarn = 410; rpmCrit = 440; rpmMax = 500;
  }

  // Apply failure clues based on status
  if (spec.status === 'warning' || spec.status === 'critical') {
    const isCrit = spec.status === 'critical';
    const failType = index % 4; // Distribute failure types

    if (failType === 0) { // Bearing Failure
      vibBase = isCrit ? vibCrit + 0.5 : 3.43;
      tempBase = isCrit ? tempCrit + 2 : 61.70;
    } else if (failType === 1) { // Hydraulic Failure
      maintBase = isCrit ? 400 : 264;
      vibBase = isCrit ? vibWarn + 1 : 2.02;
      tempBase = isCrit ? tempWarn + 2 : 55.13;
    } else if (failType === 2) { // Electrical Failure
      currBase = isCrit ? currCrit + 1 : 14.11;
      tempBase = isCrit ? tempWarn + 1 : 56.79;
    } else { // Motor Overheat
      tempBase = isCrit ? tempCrit + 3 : 73.62;
      vibBase = isCrit ? vibWarn + 0.5 : 1.75;
    }
  }

  return {
    id: machineId,
    name: spec.name,
    type: spec.type,
    location: `Building ${String.fromCharCode(65 + (index % 5))} - Floor ${(index % 3) + 1}`,
    status: spec.status as MachineStatus,
    lastMaintenance: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
    nextMaintenance: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
    efficiency: spec.eff,
    uptime: maintBase,
    sensors: [
      {
        id: `SEN-${String(sensorStart).padStart(3, '0')}`,
        name: 'Vibration RMS',
        type: 'vibration',
        value: Number(vibBase.toFixed(2)),
        unit: 'mm/s',
        min: 0,
        max: vibMax,
        threshold: { warning: vibWarn, critical: vibCrit },
        history: generateTimeSeriesData(10, vibBase, vibVar),
      },
      {
        id: `SEN-${String(sensorStart + 1).padStart(3, '0')}`,
        name: 'Motor Temp',
        type: 'temperature',
        value: Number(tempBase.toFixed(1)),
        unit: '°C',
        min: 0,
        max: tempMax,
        threshold: { warning: tempWarn, critical: tempCrit },
        history: generateTimeSeriesData(10, tempBase, tempVar),
      },
      {
        id: `SEN-${String(sensorStart + 2).padStart(3, '0')}`,
        name: 'Current Phase',
        type: 'power',
        value: Number(currBase.toFixed(1)),
        unit: 'A',
        min: 0,
        max: currMax,
        threshold: { warning: currWarn, critical: currCrit },
        history: generateTimeSeriesData(10, currBase, currVar),
      },
      {
        id: `SEN-${String(sensorStart + 3).padStart(3, '0')}`,
        name: 'Pressure Level',
        type: 'pressure',
        value: Number(pressBase.toFixed(1)),
        unit: 'bar',
        min: 0,
        max: pressMax,
        threshold: { warning: pressWarn, critical: pressCrit },
        history: generateTimeSeriesData(10, pressBase, pressVar),
      },
      {
        id: `SEN-${String(sensorStart + 4).padStart(3, '0')}`,
        name: 'Rotational Speed',
        type: 'rpm',
        value: Number(rpmBase.toFixed(0)),
        unit: 'RPM',
        min: 0,
        max: rpmMax,
        threshold: { warning: rpmWarn, critical: rpmCrit },
        history: generateTimeSeriesData(10, rpmBase, rpmVar),
      },
      {
        id: `SEN-${String(sensorStart + 5).padStart(3, '0')}`,
        name: 'Ambient Temp',
        type: 'temperature',
        value: Number(ambBase.toFixed(1)),
        unit: '°C',
        min: 0,
        max: ambMax,
        threshold: { warning: ambWarn, critical: ambCrit },
        history: generateTimeSeriesData(10, ambBase, ambVar),
      }
    ],
  };
});

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

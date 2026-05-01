"use client";

import { machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/endpoints";
import {
  ArrowLeft,
  Activity,
  Gauge,
  Clock,
  MapPin,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Vibrate,
  Zap,
  Settings,
  BarChart2,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  CircleSlash2,
} from "lucide-react";
import Link from "next/link";
import type { MachineStatus, MachineSensor } from "@/types";
import type { AIResultPayload } from "@/types";
import {
  getMachineMaintenanceEntries,
  machineToMaintenanceEntry,
  saveMaintenanceEntry,
  subscribeMaintenanceEntriesChange,
} from "@/lib/maintenance-schedule";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const statusConfig: Record<
  MachineStatus,
  { label: string; className: string; dotClass: string; badge: string }
> = {
  operational: {
    label: "Operational",
    className: "border-success bg-success/10",
    dotClass: "bg-success",
    badge: "bg-success/10 text-success border-success/30",
  },
  warning: {
    label: "Warning",
    className: "border-warning bg-warning/10",
    dotClass: "bg-warning animate-pulse",
    badge: "bg-warning/10 text-warning border-warning/30",
  },
  critical: {
    label: "Critical",
    className: "border-critical bg-critical/10",
    dotClass: "bg-critical animate-pulse",
    badge: "bg-critical/10 text-critical border-critical/30",
  },
  offline: {
    label: "Offline",
    className: "border-muted bg-muted/10",
    dotClass: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

const sensorIcons: Record<string, typeof Thermometer> = {
  temperature: Thermometer,
  vibration: Vibrate,
  power: Zap,
  pressure: Gauge,
  rpm: Settings,
};

interface MaintenanceLogItem {
  date: string;
  type: string;
  description: string;
  technician: string;
  status: "completed" | "scheduled";
}

interface AiRecommendationResponse {
  recommendation: string;
  generatedAt: string;
}

const REGISTERED_MEMBERS = [
  "Current User",
  "John Smith",
  "Sarah Johnson",
  "Mike Wilson",
  "Aisha Khan",
  "David Lee",
] as const;

const AI_RECOMMENDATION_CACHE_PREFIX = "intelliviz-ai-reco:";

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machine = machines.find((m) => m.id === params.id);
  const [machineStatus, setMachineStatus] = useState<MachineStatus>(machine?.status ?? "operational");
  const [configOpen, setConfigOpen] = useState(false);
  const [maintainOpen, setMaintainOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>(machine?.sensors.map((sensor) => sensor.id) ?? []);
  const [maintenanceType, setMaintenanceType] = useState("Scheduled Maintenance");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [maintenanceAssignee, setMaintenanceAssignee] = useState<string>(REGISTERED_MEMBERS[0]);
  const [activeTab, setActiveTab] = useState("sensors");
  const [generatedRecommendation, setGeneratedRecommendation] = useState<string | null>(null);
  const [recommendationGeneratedAt, setRecommendationGeneratedAt] = useState<string | null>(null);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogItem[]>([]);

  if (!machine) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Machine not found</p>
      </div>
    );
  }

  const config = statusConfig[machineStatus];
  const visibleSensors = machine.sensors.filter((sensor) => selectedSensorIds.includes(sensor.id));
  const hasVisibleSensors = visibleSensors.length > 0;
  const machineAiResults = useMemo(
    () =>
      visibleSensors.map((sensor) => {
        const ratio = sensor.threshold.critical > 0 ? sensor.value / sensor.threshold.critical : 0;
        const riskScore = Math.max(5, Math.min(100, Math.round(ratio * 100)));
        const alertLevel = riskScore >= 75 ? "critical" : riskScore >= 45 ? "warning" : "info";
        const confidence = Math.max(60, Math.min(98, 92 - Math.abs(70 - riskScore) / 2));

        const predictionType =
          sensor.type === "temperature"
            ? "Thermal runaway risk"
            : sensor.type === "vibration"
            ? "Bearing wear / imbalance risk"
            : sensor.type === "power"
            ? "Electrical load instability"
            : sensor.type === "pressure"
            ? "Pressure system fault trend"
            : "Rotational drift trend";

        const rootCause =
          sensor.value >= sensor.threshold.critical
            ? `${sensor.name} exceeded critical threshold.`
            : sensor.value >= sensor.threshold.warning
            ? `${sensor.name} is trending above warning threshold.`
            : `${sensor.name} is stable but monitored for drift.`;

        const aiRecommendation =
          sensor.value >= sensor.threshold.critical
            ? "Run immediate inspection and lower machine load until stabilized."
            : sensor.value >= sensor.threshold.warning
            ? "Schedule targeted diagnostics in the next maintenance window."
            : "Continue monitoring and keep current preventive schedule.";

        const aiResult: AIResultPayload = {
          predictionType,
          riskScore,
          confidence: Math.round(confidence),
          alertLevel,
          rootCause,
          aiRecommendation,
        };

        return {
          sensor,
          aiResult,
        };
      }),
    [visibleSensors]
  );

  const predictionSnapshot = useMemo(() => {
    if (machineAiResults.length === 0) {
      return {
        failureProbability: 0,
        estTimeToFailureDays: 0,
        efficiencyForecast: 0,
        recommendations: [] as string[],
      };
    }

    const avgRisk = machineAiResults.reduce((sum, item) => sum + item.aiResult.riskScore, 0) / machineAiResults.length;
    const maxRisk = Math.max(...machineAiResults.map((item) => item.aiResult.riskScore));
    const avgConfidence = machineAiResults.reduce((sum, item) => sum + item.aiResult.confidence, 0) / machineAiResults.length;

    const failureProbability = Math.max(8, Math.min(95, Math.round(avgRisk * 0.35)));
    const estTimeToFailureDays = Math.max(3, Math.round((100 - maxRisk) * 1.8));
    const efficiencyForecast = Number((((avgConfidence - avgRisk) / 25)).toFixed(1));

    const recommendations = machineAiResults
      .slice(0, 3)
      .map((item) => {
        if (item.aiResult.alertLevel === "critical") {
          return `${item.sensor.name} requires immediate inspection and controlled load reduction.`;
        }
        if (item.aiResult.alertLevel === "warning") {
          return `${item.sensor.name} trend is rising. Schedule targeted diagnostics in the next maintenance window.`;
        }
        return `${item.sensor.name} is stable. Continue routine checks and preventive maintenance schedule.`;
      });

    return {
      failureProbability,
      estTimeToFailureDays,
      efficiencyForecast,
      recommendations,
    };
  }, [machineAiResults]);

  const recommendationCacheKey = `${AI_RECOMMENDATION_CACHE_PREFIX}${machine.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cachedRaw = window.sessionStorage.getItem(recommendationCacheKey);
    if (!cachedRaw) return;

    try {
      const cached = JSON.parse(cachedRaw) as AiRecommendationResponse;
      if (cached.recommendation) {
        setGeneratedRecommendation(cached.recommendation);
        setRecommendationGeneratedAt(cached.generatedAt ?? null);
      }
    } catch {
      window.sessionStorage.removeItem(recommendationCacheKey);
    }
  }, [recommendationCacheKey]);

  const handleGetAiRecommendation = async (forceRefresh = false) => {
    if (typeof window === "undefined") return;

    if (!forceRefresh && generatedRecommendation) {
      return;
    }

    try {
      setIsRecommendationLoading(true);

      const response = await apiClient.post<AiRecommendationResponse>(
        API_ENDPOINTS.MACHINE_AI_RECOMMENDATION,
        {
          machineId: machine.id,
          machineName: machine.name,
          failureProbability: predictionSnapshot.failureProbability,
          estTimeToFailureDays: predictionSnapshot.estTimeToFailureDays,
          efficiencyForecast: predictionSnapshot.efficiencyForecast,
          statuses: machineAiResults.map((item) => item.aiResult.alertLevel),
        }
      );

      setGeneratedRecommendation(response.recommendation);
      setRecommendationGeneratedAt(response.generatedAt);
      window.sessionStorage.setItem(recommendationCacheKey, JSON.stringify(response));
      toast.success(forceRefresh ? "AI recommendation regenerated" : "AI recommendation generated");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to generate recommendation";
      toast.error(message);
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  const sensorAlerts = visibleSensors.flatMap((sensor) => {
    if (sensor.value >= sensor.threshold.critical) {
      return [{
        level: "critical" as const,
        title: `${sensor.name} is critical`,
        message: `Current reading is ${sensor.value} ${sensor.unit}, which is above the critical limit of ${sensor.threshold.critical} ${sensor.unit}.`,
      }];
    }

    if (sensor.value >= sensor.threshold.warning) {
      return [{
        level: "warning" as const,
        title: `${sensor.name} needs attention`,
        message: `Current reading is ${sensor.value} ${sensor.unit}, above the warning limit of ${sensor.threshold.warning} ${sensor.unit}.`,
      }];
    }

    return [];
  });

  const handleDeleteMachine = () => {
    router.push("/machines");
  };

  useEffect(() => {
    if (!machine) {
      return;
    }

    const baseLogs: MaintenanceLogItem[] = [
      {
        date: machine.lastMaintenance,
        type: "Scheduled Maintenance",
        description: "Full system inspection and lubrication",
        technician: "John Smith",
        status: "completed",
      },
      {
        date: "2026-02-15",
        type: "Emergency Repair",
        description: "Replaced worn spindle bearing",
        technician: "Sarah Johnson",
        status: "completed",
      },
      {
        date: "2026-01-10",
        type: "Scheduled Maintenance",
        description: "Quarterly maintenance check",
        technician: "Mike Wilson",
        status: "completed",
      },
    ];

    const hydrateLogs = () => {
      const storedLogs = getMachineMaintenanceEntries(machine.id).map((entry) => ({
        date: entry.date,
        type: entry.type,
        description: entry.note,
        technician: entry.assignee,
        status: entry.status,
      }));

      const uniqueLogs = [...storedLogs, ...baseLogs].filter((log, index, array) => {
        return array.findIndex((candidate) => {
          return (
            candidate.date === log.date &&
            candidate.type === log.type &&
            candidate.description === log.description &&
            candidate.technician === log.technician &&
            candidate.status === log.status
          );
        }) === index;
      });

      setMaintenanceLogs(uniqueLogs);
    };

    hydrateLogs();

    return subscribeMaintenanceEntriesChange(hydrateLogs);
  }, [machine]);

  const handleSaveMaintenance = () => {
    const nextLog: MaintenanceLogItem = {
      date: maintenanceDate,
      type: maintenanceType.trim(),
      description: maintenanceNote.trim(),
      technician: maintenanceAssignee.trim(),
      status: "scheduled",
    };

    if (machine) {
      saveMaintenanceEntry(
        machineToMaintenanceEntry(
          machine,
          maintenanceDate,
          maintenanceType.trim(),
          maintenanceAssignee.trim(),
          maintenanceNote.trim(),
          "machine"
        )
      );
    }
    toast.success("Maintenance saved");
    setMaintainOpen(false);
    setMaintenanceType("Scheduled Maintenance");
    setMaintenanceDate("");
    setMaintenanceNote("");
    setMaintenanceAssignee(REGISTERED_MEMBERS[0]);
    setActiveTab("maintenance");
  };

  const handleAssignToCurrentUser = () => {
    toast.success(`Maintenance assigned to ${maintenanceAssignee}`);
  };

  const handleAcknowledgeAlerts = () => {
    toast.success("Alerts acknowledged");
    setAlertsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/machines"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Machines
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {machine.name}
            </h1>
            <Badge variant="outline" className={config.badge}>
              <span
                className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", config.dotClass)}
              />
              {config.label}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {machine.type} - {machine.id}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <Dialog open={maintainOpen} onOpenChange={setMaintainOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wrench className="h-4 w-4" />
                Maintain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Maintenance Entry</DialogTitle>
                <DialogDescription>
                  Create a quick maintenance entry for {machine.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Maintenance Type</p>
                  <Input
                    value={maintenanceType}
                    onChange={(event) => setMaintenanceType(event.target.value)}
                    placeholder="e.g. Emergency Repair, Calibration, Inspection"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Maintenance Date</p>
                  <Input
                    type="date"
                    value={maintenanceDate}
                    onChange={(event) => setMaintenanceDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assignee</p>
                  <div className="flex gap-2">
                    <Select value={maintenanceAssignee} onValueChange={setMaintenanceAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGISTERED_MEMBERS.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAssignToCurrentUser}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Note</p>
                  <Textarea
                    value={maintenanceNote}
                    onChange={(event) => setMaintenanceNote(event.target.value)}
                    placeholder="Add maintenance instructions, parts needed, or notes..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMaintainOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveMaintenance} disabled={!maintenanceType.trim() || !maintenanceDate || !maintenanceAssignee.trim() || !maintenanceNote.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Machine Alerts</DialogTitle>
                <DialogDescription>
                  Active warnings and critical readings from the selected sensors.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {sensorAlerts.length > 0 ? (
                  sensorAlerts.map((alert) => (
                    <div
                      key={`${alert.level}-${alert.title}`}
                      className={cn(
                        "rounded-xl border p-4",
                        alert.level === "critical"
                          ? "border-critical/30 bg-critical/5"
                          : "border-warning/30 bg-warning/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{alert.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            alert.level === "critical"
                              ? "border-critical/30 text-critical"
                              : "border-warning/30 text-warning"
                          )}
                        >
                          {alert.level}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                    No active alerts for the selected sensors.
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAlertsOpen(false)}>
                  Close
                </Button>
                <Button type="button" onClick={handleAcknowledgeAlerts} disabled={sensorAlerts.length === 0}>
                  Acknowledge All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                Config
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Machine Config</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Update state and choose which sensors should stay visible on the screen.
                </p>
              </DialogHeader>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Current State</p>
                      <p className="mt-1 text-lg font-semibold">{config.label}</p>
                    </div>
                    <Badge variant="outline" className={cn("px-3 py-1", config.badge)}>
                      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", config.dotClass)} />
                      Live
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {([
                      { value: "operational", label: "On / Operational", icon: CheckCircle2 },
                      { value: "warning", label: "Warning", icon: AlertTriangle },
                      { value: "critical", label: "Critical", icon: AlertOctagon },
                      { value: "offline", label: "Off / Offline", icon: CircleSlash2 },
                    ] as const).map((item) => {
                      const ItemIcon = item.icon;
                      const active = machineStatus === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setMachineStatus(item.value)}
                          className={cn(
                            "flex h-12 items-center gap-2 rounded-xl border px-3 text-left text-sm font-medium transition-all",
                            active
                              ? "border-primary bg-primary/10 text-foreground shadow-sm"
                              : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <ItemIcon className="h-4 w-4 shrink-0" />
                          <span className="leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Sensor Visibility</p>
                      <p className="text-xs text-muted-foreground">
                        Only selected sensors will appear below on the page.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => setSelectedSensorIds(machine.sensors.map((sensor) => sensor.id))}
                    >
                      Show all
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {machine.sensors.map((sensor) => {
                      const Icon = sensorIcons[sensor.type] || Activity;
                      const selected = selectedSensorIds.includes(sensor.id);
                      return (
                        <label
                          key={sensor.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border/60 bg-background/40 opacity-70"
                          )}
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              const nextSelected = Boolean(checked);
                              setSelectedSensorIds((current) =>
                                nextSelected
                                  ? [...new Set([...current, sensor.id])]
                                  : current.filter((id) => id !== sensor.id)
                              );
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <p className="text-sm font-medium leading-tight">{sensor.name}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {sensor.value} {sensor.unit} now
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              <DialogFooter className="items-center justify-between sm:justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete machine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {machine.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the machine from the current view and take you back to the Machines list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteMachine}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setConfigOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setConfigOpen(false)}>
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  machine.efficiency >= 90
                    ? "text-success"
                    : machine.efficiency >= 70
                    ? "text-warning"
                    : "text-critical"
                )}
              >
                {machine.efficiency}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Gauge className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">{machine.uptime}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
              <MapPin className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-lg font-medium">{machine.location}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Maintenance</p>
              <p className="text-lg font-medium">{machine.nextMaintenance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="sensors" className="gap-2">
            <Activity className="h-4 w-4" />
            Live Sensors
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Historical Data
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            AI Predictions
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {hasVisibleSensors ? (
              visibleSensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No sensors are selected in Config.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {hasVisibleSensors ? (
            visibleSensors.map((sensor) => <SensorHistoryChart key={sensor.id} sensor={sensor} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No sensor history to show because none are selected.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="overflow-hidden border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>AI Predictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {machineAiResults.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No active sensor inference available. Enable sensors from Config to generate AI results.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-border/70 bg-background/35 p-4">
                      <p className="text-xs text-muted-foreground">Failure Probability</p>
                      <p className="mt-1.5 text-2xl font-semibold text-emerald-400 sm:text-3xl">{predictionSnapshot.failureProbability}%</p>
                      <p className="mt-2 text-xs text-muted-foreground">Based on current sensor patterns</p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/35 p-4">
                      <p className="text-xs text-muted-foreground">Est. Time to Failure</p>
                      <p className="mt-1.5 text-2xl font-semibold text-cyan-400 sm:text-3xl">{predictionSnapshot.estTimeToFailureDays} days</p>
                      <p className="mt-2 text-xs text-muted-foreground">Predicted maintenance window</p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/35 p-4 md:col-span-2 xl:col-span-1">
                      <p className="text-xs text-muted-foreground">Efficiency Forecast</p>
                      <p className={cn(
                        "mt-1.5 text-2xl font-semibold sm:text-3xl",
                        predictionSnapshot.efficiencyForecast >= 0 ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {predictionSnapshot.efficiencyForecast >= 0 ? "+" : ""}{predictionSnapshot.efficiencyForecast}%
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">Next 7 days projection</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/35 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => handleGetAiRecommendation(false)}
                        disabled={isRecommendationLoading}
                        className="h-9"
                      >
                        {isRecommendationLoading ? "Generating..." : "Get AI Recommendation"}
                      </Button>

                      {generatedRecommendation && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleGetAiRecommendation(true)}
                          disabled={isRecommendationLoading}
                          className="h-9"
                        >
                          Regenerate
                        </Button>
                      )}
                    </div>

                    {generatedRecommendation ? (
                      <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                        <p className="text-sm text-foreground">{generatedRecommendation}</p>
                        {recommendationGeneratedAt && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Generated at: {new Date(recommendationGeneratedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Click "Get AI Recommendation" to generate runtime AI guidance.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{log.type}</p>
                        <Badge
                          variant="outline"
                          className={log.status === "completed" ? "text-success" : "text-warning"}
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {log.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{log.date}</span>
                        <span>Technician: {log.technician}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SensorCard({ sensor }: { sensor: MachineSensor }) {
  const Icon = sensorIcons[sensor.type] || Activity;
  const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  const isWarning = sensor.value >= sensor.threshold.warning;
  const isCritical = sensor.value >= sensor.threshold.critical;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isCritical
                  ? "bg-critical/10"
                  : isWarning
                  ? "bg-warning/10"
                  : "bg-primary/10"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isCritical
                    ? "text-critical"
                    : isWarning
                    ? "text-warning"
                    : "text-primary"
                )}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{sensor.name}</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  isCritical
                    ? "text-critical"
                    : isWarning
                    ? "text-warning"
                    : "text-foreground"
                )}
              >
                {sensor.value} {sensor.unit}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              Range: {sensor.min} - {sensor.max} {sensor.unit}
            </p>
            <p className="text-warning">
              Warning: {sensor.threshold.warning} {sensor.unit}
            </p>
            <p className="text-critical">
              Critical: {sensor.threshold.critical} {sensor.unit}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "absolute h-full rounded-full transition-all",
                isCritical ? "bg-critical" : isWarning ? "bg-warning" : "bg-primary"
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-warning"
              style={{
                left: `${((sensor.threshold.warning - sensor.min) / (sensor.max - sensor.min)) * 100}%`,
              }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-critical"
              style={{
                left: `${((sensor.threshold.critical - sensor.min) / (sensor.max - sensor.min)) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SensorHistoryChart({ sensor }: { sensor: MachineSensor }) {
  const [data, setData] = useState(sensor.history);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const nextTime = new Date(new Date(last.timestamp).getTime() + 60 * 60 * 1000); // simulate hourly step for the chart size
        const variance = (sensor.max - sensor.min) * 0.02;
        const nextValue = Math.max(sensor.min, Math.min(sensor.max, last.value + (Math.random() - 0.5) * variance));
        return [...prev.slice(1), { timestamp: nextTime.toISOString(), value: Number(nextValue.toFixed(1)) }];
      });
    }, 1500); // update every 1.5s for live effect
    return () => clearInterval(interval);
  }, [sensor]);

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{sensor.name} - 24h History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.75 0.18 195)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.75 0.18 195)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                tick={{ fill: "currentColor", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[sensor.min, sensor.max]}
                tick={{ fill: "currentColor", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.timestamp).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {data.value} {sensor.unit}
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={sensor.threshold.warning}
                stroke="oklch(0.8 0.18 85)"
                strokeDasharray="5 5"
              />
              <ReferenceLine
                y={sensor.threshold.critical}
                stroke="oklch(0.6 0.25 27)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.75 0.18 195)"
                strokeWidth={2}
                fill={`url(#color${sensor.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function PredictionCard({
  title,
  value,
  trend,
  description,
}: {
  title: string;
  value: string;
  trend: "low" | "normal" | "positive" | "negative";
  description: string;
}) {
  const trendColors = {
    low: "text-success",
    normal: "text-info",
    positive: "text-success",
    negative: "text-critical",
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={cn("mt-1 text-2xl font-bold", trendColors[trend])}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

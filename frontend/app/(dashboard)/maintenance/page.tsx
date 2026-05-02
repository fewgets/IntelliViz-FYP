"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Wrench,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar as BigCalendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { addHours, format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import {
  createMaintenanceEntry,
  formatMaintenanceDate,
  getMaintenanceDayKey,
  getMaintenanceTimelineStatus,
  loadMaintenanceEntries,
  machineToMaintenanceEntry,
  saveMaintenanceEntry,
  subscribeMaintenanceEntriesChange,
  type MaintenanceEntry,
} from "@/lib/maintenance-schedule";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function formatCalendarDay(date: Date) {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function getDayTimeLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "All day";
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

type MaintenanceCalendarView = View;

interface MaintenanceCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  machineName: string;
  assignee: string;
  note: string;
  type: string;
  status: "past" | "present" | "future";
  entry: MaintenanceEntry;
}

function statusToneClass(status: MaintenanceCalendarEvent["status"]) {
  if (status === "past") return "bg-muted/70 text-muted-foreground border-border/60";
  if (status === "present") return "bg-warning/10 text-warning border-warning/20";
  return "bg-primary/10 text-primary border-primary/20";
}

function statusDotClass(status: MaintenanceCalendarEvent["status"]) {
  if (status === "past") return "bg-muted-foreground";
  if (status === "present") return "bg-warning";
  return "bg-primary";
}

function CalendarEventBlock({ event }: { event: MaintenanceCalendarEvent }) {
  return (
    <div className={cn("flex h-full flex-col gap-1 rounded-xl border px-2 py-1.5 text-[11px] shadow-sm", statusToneClass(event.status))}>
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass(event.status))} />
        <span className="truncate font-semibold leading-none">{event.title}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
        <span className="truncate">{event.machineName}</span>
        <span className="uppercase tracking-[0.18em]">{event.status}</span>
      </div>
    </div>
  );
}

function CalendarToolbar({ label, onNavigate, onView, view }: any) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => onNavigate("PREV")}>
          <span aria-hidden>‹</span>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full px-3" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => onNavigate("NEXT")}>
          <span aria-hidden>›</span>
        </Button>
        <div className="ml-2 hidden sm:block">
          <p className="text-sm font-semibold tracking-tight">{label}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1">
        <Button
          variant={view === Views.MONTH ? "default" : "ghost"}
          size="sm"
          className="rounded-full px-3"
          onClick={() => onView(Views.MONTH)}
        >
          Month
        </Button>
        <Button
          variant={view === Views.WEEK ? "default" : "ghost"}
          size="sm"
          className="rounded-full px-3"
          onClick={() => onView(Views.WEEK)}
        >
          Week
        </Button>
      </div>
    </div>
  );
}

const snapshotGlowColors = {
  critical: "color-mix(in oklch, var(--critical), transparent 82%)",
  warning: "color-mix(in oklch, var(--warning), transparent 82%)",
  primary: "color-mix(in oklch, var(--primary), transparent 82%)",
  success: "color-mix(in oklch, var(--success), transparent 82%)",
} as const;

function MaintenanceSnapshotCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof snapshotGlowColors;
}) {
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  return (
    <Card
      className="group relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl transition-all hover:bg-card/50 h-full flex flex-col justify-center"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointerPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }}
      onMouseLeave={() => setPointerPosition({ x: 0, y: 0 })}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage: `radial-gradient(circle at ${pointerPosition.x}px ${pointerPosition.y}px, ${snapshotGlowColors[tone]}, transparent 70%)`,
        }}
      />
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${tone === "critical" ? "via-critical/50" : tone === "warning" ? "via-warning/50" : tone === "success" ? "via-success/50" : "via-primary/50"} to-transparent`} />
      <CardContent className="flex items-center gap-3 p-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone === "critical" ? "border-critical/20 bg-critical/10" : tone === "warning" ? "border-warning/20 bg-warning/10" : tone === "success" ? "border-success/20 bg-success/10" : "border-primary/20 bg-primary/10"}`}>
          <Icon className={`h-4 w-4 ${tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary"}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className={`text-xl font-bold tracking-tight mt-0.5 ${tone === "critical" ? "text-critical" : tone === "success" ? "text-success" : ""}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MaintenancePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<MaintenanceCalendarEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<MaintenanceCalendarView>(Views.MONTH);
  const [savedEntries, setSavedEntries] = useState<MaintenanceEntry[]>([]);
  const [scheduleMachineId, setScheduleMachineId] = useState(machines[0]?.id ?? "");
  const [scheduleType, setScheduleType] = useState("Scheduled Maintenance");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleAssignee, setScheduleAssignee] = useState("Current User");
  const [scheduleNote, setScheduleNote] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Generate failure prediction data
  const predictionData = useMemo(() => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        probability: Math.round(5 + Math.sin(i / 5) * 3 + (i < 10 ? (10 - i) * 2 : 0)),
        threshold: 20,
      });
    }
    return data;
  }, []);

  // Example maintenance schedule shown in the UI. Kept local to this page.
  const maintenanceSchedule = [
    {
      machine: machines.find((m) => m.id === "MCH-004")!,
      type: "Emergency",
      dateLabel: "Overdue",
      dateISO: "2026-02-10",
      priority: "critical",
      assignee: "Maintenance Crew",
      reason: "Critical temperature and vibration levels",
    },
    {
      machine: machines.find((m) => m.id === "MCH-002")!,
      type: "Scheduled",
      dateLabel: "Apr 1, 2026",
      dateISO: "2026-04-01",
      priority: "warning",
      assignee: "Onsite Team",
      reason: "Quarterly maintenance check",
    },
    {
      machine: machines.find((m) => m.id === "MCH-001")!,
      type: "Inspection",
      dateLabel: "Apr 15, 2026",
      dateISO: "2026-04-15",
      priority: "info",
      assignee: "Sarah Johnson",
      reason: "Monthly inspection",
    },
    {
      machine: machines.find((m) => m.id === "MCH-005")!,
      type: "AI Predicted",
      dateLabel: "May 10, 2026",
      dateISO: "2026-05-10",
      priority: "info",
      assignee: "Aisha Khan",
      reason: "AI detects wear pattern on injection screw",
    },
  ];

  // Consolidate saved entries with seeded schedule entries for the calendar
  const calendarEntries = useMemo(() => {
    const seededEntries = maintenanceSchedule.map((item) =>
      createMaintenanceEntry({
        machineId: item.machine.id,
        machineName: item.machine.name,
        type: item.type,
        date: item.dateISO,
        assignee: item.assignee,
        note: item.reason,
        status: "scheduled",
        source: "maintenance",
      })
    );

    return [...savedEntries, ...seededEntries].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    );
  }, [savedEntries]);

  const calendarEvents = useMemo(() => {
    return calendarEntries.map((entry) => {
      const parsedStart = new Date(`${entry.date}T09:00:00`);
      const start = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
      const end = addHours(start, 1);
      return {
        id: entry.id,
        title: entry.type,
        start,
        end,
        allDay: false,
        machineName: entry.machineName,
        assignee: entry.assignee,
        note: entry.note,
        type: entry.type,
        status: getMaintenanceTimelineStatus(entry),
        entry,
      } satisfies MaintenanceCalendarEvent;
    });
  }, [calendarEntries]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedCalendarDate) return calendarEvents;
    return calendarEvents.filter((event) => sameDay(event.start, selectedCalendarDate));
  }, [calendarEvents, selectedCalendarDate]);

  const groupedAgenda = useMemo(() => {
    const bucket = new Map<string, MaintenanceCalendarEvent[]>();

    calendarEvents.forEach((event) => {
      const dayKey = getMaintenanceDayKey(event.entry.date);
      const current = bucket.get(dayKey) ?? [];
      current.push(event);
      bucket.set(dayKey, current);
    });

    return Array.from(bucket.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dayKey, entries]) => ({
        dayKey,
        entries: entries.sort((left, right) => left.start.getTime() - right.start.getTime()),
      }));
  }, [calendarEvents]);

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    return calendarEvents
      .filter((event) => startOfDay(event.start).getTime() >= today.getTime())
      .slice(0, 6);
  }, [calendarEvents]);

  useEffect(() => {
    const refreshEntries = () => setSavedEntries(loadMaintenanceEntries());

    refreshEntries();
    return subscribeMaintenanceEntriesChange(refreshEntries);
  }, []);

  useEffect(() => {
    if (!scheduleOpen) return;
    setScheduleDate(new Date().toISOString().slice(0, 10));
  }, [scheduleOpen]);

  const openScheduleDialog = (machineId?: string, type?: string, note?: string, assignee?: string) => {
    setScheduleMachineId(machineId ?? machines[0]?.id ?? "");
    setScheduleType(type ?? "Scheduled Maintenance");
    setScheduleNote(note ?? "");
    setScheduleAssignee(assignee ?? "Current User");
    setScheduleDate(new Date().toISOString().slice(0, 10));
    setScheduleOpen(true);
  };

  const handleSaveSchedule = () => {
    const targetMachine = machines.find((machine) => machine.id === scheduleMachineId);
    if (!targetMachine) return;

    const nextEntry = machineToMaintenanceEntry(
      targetMachine,
      scheduleDate,
      scheduleType.trim(),
      scheduleAssignee.trim(),
      scheduleNote.trim() || "Scheduled from maintenance page",
      "maintenance"
    );

    saveMaintenanceEntry(nextEntry);
    setScheduleOpen(false);
  };

  const handleCalendarSelectSlot = ({ start }: { start: Date }) => {
    setSelectedCalendarDate(start);
    setCalendarDate(start);
  };

  const handleCalendarSelectEvent = (event: MaintenanceCalendarEvent) => {
    setSelectedCalendarEvent(event);
    setEventDetailsOpen(true);
  };


  const selectedCalendarDayKey = selectedCalendarDate
    ? getMaintenanceDayKey(selectedCalendarDate.toISOString())
    : null;

  const selectedCalendarEntries = useMemo(() => {
    if (!selectedCalendarDayKey) return calendarEntries;
    return calendarEntries.filter((entry) => getMaintenanceDayKey(entry.date) === selectedCalendarDayKey);
  }, [calendarEntries, selectedCalendarDayKey]);
  const aiPredictions = [
    {
      machine: machines.find((m) => m.id === "MCH-004")!,
      failureProbability: 87,
      estimatedDays: 2,
      component: "Belt & Motor Assembly",
      confidence: 94,
    },
    {
      machine: machines.find((m) => m.id === "MCH-002")!,
      failureProbability: 35,
      estimatedDays: 14,
      component: "Hydraulic Seals",
      confidence: 82,
    },
    {
      machine: machines.find((m) => m.id === "MCH-003")!,
      failureProbability: 12,
      estimatedDays: 45,
      component: "Joint Bearings",
      confidence: 78,
    },
    {
      machine: machines.find((m) => m.id === "MCH-001")!,
      failureProbability: 8,
      estimatedDays: 60,
      component: "Spindle Bearings",
      confidence: 85,
    },
  ];

  return (
    <div 
      className="-mt-3 sm:-mt-4 lg:-mt-5"
      onMouseMove={handleMouseMove}
      style={{
        // @ts-ignore
        "--mouse-x": `${mousePosition.x}px`,
        "--mouse-y": `${mousePosition.y}px`,
      }}
    >
      {/* ABOVE THE FOLD HERO SECTION */}
      <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[500px] mb-8 gap-3 sm:gap-4">
        {/* 1. Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Predictive Maintenance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              AI-powered failure prediction and maintenance scheduling
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-card/40 backdrop-blur-md shadow-lg px-3" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-card/40 backdrop-blur-md shadow-lg px-3" onClick={() => {
              const csvRows = [
                ["Machine", "Component", "Probability (%)", "Est. Days", "Confidence (%)"],
                ...aiPredictions.map(p => [
                  p.machine.name,
                  p.component,
                  p.failureProbability,
                  p.estimatedDays,
                  p.confidence
                ])
              ];
              const csvContent = csvRows.map(e => e.join(",")).join("\n");
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "predictive_maintenance_report.csv";
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-card/40 backdrop-blur-md shadow-lg px-3" onClick={() => setCalendarOpen(true)}>
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Calendar
            </Button>
            <Button size="sm" className="h-8 text-xs shadow-lg shadow-primary/20 px-3" onClick={() => openScheduleDialog()}>
              <Wrench className="mr-1.5 h-3.5 w-3.5" />
              Schedule
            </Button>
          </div>
        </motion.div>

        {/* 2. KPI Cards */}
        <div className="grid flex-shrink-0 gap-3 grid-cols-2 lg:grid-cols-4 h-24">
          <MaintenanceSnapshotCard title="Total Machines" value={machines.length} icon={Activity} tone="success" />
          <MaintenanceSnapshotCard title="Healthy Machines" value={machines.filter(m => m.status === "operational").length} icon={CheckCircle2} tone="success" />
          <MaintenanceSnapshotCard title="At-Risk Machines" value={machines.filter(m => m.status === "warning").length} icon={AlertTriangle} tone="warning" />
          <MaintenanceSnapshotCard title="Critical Alerts" value={machines.filter(m => m.status === "critical" || m.status === "offline").length} icon={XCircle} tone="critical" />
        </div>

        {/* 3. Main Insight Area */}
        <div className="flex-1 grid gap-3 lg:grid-cols-3 lg:gap-4 min-h-0">
          {/* AI Failure Prediction Chart - 65/70% Width */}
          <Card className="relative flex flex-col overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl lg:col-span-2">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="flex-shrink-0 p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground/90">
                  <Brain className="h-5 w-5 text-primary" />
                  Predictive Anomaly Trend
                </CardTitle>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Live Analysis</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 pt-0">
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-white/10 bg-card/90 p-3 shadow-2xl backdrop-blur-md">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{data.date}</p>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                data.probability >= 50 ? "bg-critical" : data.probability >= 20 ? "bg-warning" : "bg-success"
                              )} />
                              <p className="text-sm font-bold">
                                Failure Risk: <span className={cn(
                                  data.probability >= 50 ? "text-critical" : data.probability >= 20 ? "text-warning" : "text-success"
                                )}>{data.probability}%</span>
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="probability"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#colorProbability)"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="threshold"
                      stroke="var(--warning)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      fill="none"
                      opacity={0.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-shrink-0 items-center justify-center gap-6 p-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Risk Index</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-px w-3 border-t border-dashed border-warning" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Alert Level</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule - 30/35% Width */}
          <Card className="relative flex flex-col overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
            <CardHeader className="flex-shrink-0 p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground/90">
                <Calendar className="h-5 w-5 text-rose-500" />
                Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 custom-scrollbar">
              <div className="space-y-2">
                {maintenanceSchedule.map((item, index) => (
                  <motion.div
                    key={item.machine.id + item.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "group relative rounded-lg border p-2.5 transition-all hover:bg-white/5",
                      item.priority === "critical"
                        ? "border-critical/20 bg-critical/5"
                        : item.priority === "warning"
                        ? "border-warning/20 bg-warning/5"
                        : "border-white/5 bg-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-[13px] truncate">{item.machine.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] h-3 uppercase tracking-tighter px-1 font-black",
                              item.priority === "critical"
                                ? "bg-critical/10 text-critical border-critical/20"
                                : item.priority === "warning"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 line-clamp-1 italic">{item.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn(
                          "text-[10px] font-black tracking-tighter uppercase",
                          item.dateLabel === "Overdue" ? "text-critical animate-pulse" : "text-foreground/70"
                        )}>
                          {item.dateLabel}
                        </p>
                        <button
                          className="text-[9px] font-bold text-primary hover:underline mt-0 block ml-auto uppercase tracking-widest"
                          onClick={() => openScheduleDialog(item.machine.id, item.type, item.reason, item.assignee)}
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BELOW THE FOLD SECTIONS */}
      <div className="space-y-6 sm:space-y-8">
        {/* AI Predictions Table */}
      <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground/90">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Failure Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-muted/45">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90">
                  <th className="px-3 py-1.5">Machine</th>
                  <th className="px-3 py-1.5">Risk Component</th>
                  <th className="px-3 py-1.5">Probability</th>
                  <th className="px-3 py-1.5 text-center">Est. Time</th>
                  <th className="px-3 py-1.5 text-center">Confidence</th>
                  <th className="px-3 py-1.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiPredictions.map((prediction, index) => (
                  <motion.tr
                    key={prediction.machine.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 transition-colors hover:bg-white/5"
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{prediction.machine.name}</p>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">#{prediction.machine.id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{prediction.component}</p>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/30">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              prediction.failureProbability >= 50
                                ? "bg-critical"
                                : prediction.failureProbability >= 20
                                ? "bg-warning"
                                : "bg-success"
                            )}
                            style={{ width: `${prediction.failureProbability}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-black tracking-tighter w-8",
                            prediction.failureProbability >= 50
                              ? "text-critical"
                              : prediction.failureProbability >= 20
                              ? "text-warning"
                              : "text-success"
                          )}
                        >
                          {prediction.failureProbability}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-tighter h-5",
                          prediction.estimatedDays <= 7
                            ? "border-critical/30 text-critical bg-critical/5"
                            : prediction.estimatedDays <= 14
                            ? "border-warning/30 text-warning bg-warning/5"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {prediction.estimatedDays}D
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <span className="text-[10px] font-black text-primary/70">{prediction.confidence}%</span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10">
                          View
                        </Button>
                        <Button
                          variant={prediction.failureProbability >= 50 ? "destructive" : "outline"}
                          size="sm"
                          className={cn(
                            "h-7 text-[10px] font-black uppercase tracking-widest px-3",
                            prediction.failureProbability < 50 && "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          Schedule
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-h-[94vh] max-w-[96vw] overflow-hidden p-0">
          <div className="maintenance-calendar-shell flex h-[94vh] flex-col bg-background">
            <DialogHeader className="border-b border-border/60 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">Maintenance Calendar</DialogTitle>
                  <DialogDescription>
                    Teams-style scheduling view with month and week navigation, event details, and day-by-day agenda.
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="uppercase tracking-wider">Month / Week</Badge>
                  <Badge variant="outline" className="uppercase tracking-wider">Past / Present / Future</Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="grid flex-1 min-h-0 gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="min-w-0 border-b border-border/60 bg-card/30 lg:border-b-0 lg:border-r lg:border-border/60">
                <BigCalendar
                  localizer={calendarLocalizer}
                  events={calendarEvents}
                  date={calendarDate}
                  view={calendarView}
                  views={[Views.MONTH, Views.WEEK]}
                  onNavigate={(nextDate: Date) => {
                    setCalendarDate(nextDate);
                    setSelectedCalendarDate(nextDate);
                  }}
                  onView={(nextView: View) => setCalendarView(nextView)}
                  selectable
                  onSelectSlot={handleCalendarSelectSlot}
                  onSelectEvent={handleCalendarSelectEvent}
                  popup
                  step={60}
                  timeslots={1}
                  longPressThreshold={80}
                  components={{
                    toolbar: CalendarToolbar,
                    event: CalendarEventBlock,
                  }}
                  formats={{
                    monthHeaderFormat: (date: Date) => format(date, "MMMM yyyy"),
                    dayFormat: (date: Date) => format(date, "EEE d"),
                    weekdayFormat: (date: Date) => format(date, "EEE"),
                  }}
                />
              </section>

              <aside className="min-w-0 bg-card/25 p-4">
                <div className="rounded-3xl border border-border/60 bg-background/75 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Selected day</p>
                      <h3 className="text-lg font-semibold">
                        {selectedCalendarDate ? formatCalendarDay(selectedCalendarDate) : "All events"}
                      </h3>
                    </div>
                    <Badge variant="outline" className="uppercase tracking-wider">{selectedDayEvents.length} items</Badge>
                  </div>

                  <div className="space-y-3">
                    {selectedDayEvents.length > 0 ? (
                      selectedDayEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => handleCalendarSelectEvent(event)}
                          className="group w-full rounded-2xl border border-border/60 bg-card/65 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{event.machineName}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{event.title}</p>
                            </div>
                            <Badge variant="outline" className={cn("uppercase tracking-wider", statusToneClass(event.status))}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{getDayTimeLabel(event.entry.date)}</span>
                            <span>{event.assignee}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-5 text-sm text-muted-foreground">
                        No maintenance work found for this day.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Agenda</p>
                      <Badge variant="outline" className="uppercase tracking-wider">{groupedAgenda.length} days</Badge>
                    </div>

                    <div className="max-h-[30vh] space-y-3 overflow-y-auto pr-1">
                      {groupedAgenda.map((group) => (
                        <div key={group.dayKey}>
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {formatMaintenanceDate(group.dayKey)}
                          </p>
                          <div className="space-y-2">
                            {group.entries.map((event) => (
                              <button
                                key={event.id}
                                type="button"
                                onClick={() => handleCalendarSelectEvent(event)}
                                className="flex w-full items-start gap-3 rounded-2xl border border-border/60 bg-card/55 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                              >
                                <div className={cn("mt-0.5 h-9 w-1.5 rounded-full", statusDotClass(event.status))} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-medium">{event.machineName}</p>
                                    <Badge variant="outline" className="h-5 uppercase tracking-wider text-[10px]">{event.title}</Badge>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatCalendarDay(event.start)} • {event.assignee}
                                  </p>
                                </div>
                                <Badge variant="outline" className={cn("uppercase tracking-wider", statusToneClass(event.status))}>
                                  {event.status}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-border/60 bg-background/75 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Upcoming</p>
                      <h3 className="text-base font-semibold">Next work orders</h3>
                    </div>
                    <Badge variant="outline" className="uppercase tracking-wider">{upcomingEvents.length}</Badge>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-border/60 bg-card/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{event.machineName}</p>
                            <p className="text-xs text-muted-foreground">{formatCalendarDay(event.start)}</p>
                          </div>
                          <Badge variant="outline" className={cn("uppercase tracking-wider", statusToneClass(event.status))}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{event.title}</span>
                          <span>{event.assignee}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button className="w-full" onClick={() => openScheduleDialog()}>
                      Schedule new work
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setCalendarDate(new Date())}>
                      Jump to today
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCalendarEvent?.machineName ?? "Event details"}</DialogTitle>
            <DialogDescription>
              {selectedCalendarEvent ? formatCalendarDay(selectedCalendarEvent.start) : "Maintenance event details"}
            </DialogDescription>
          </DialogHeader>

          {selectedCalendarEvent && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Task</p>
                    <p className="mt-1 text-lg font-semibold">{selectedCalendarEvent.title}</p>
                  </div>
                  <Badge variant="outline" className={cn("uppercase tracking-wider", statusToneClass(selectedCalendarEvent.status))}>
                    {selectedCalendarEvent.status}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Assignee:</span> {selectedCalendarEvent.assignee}</p>
                  <p><span className="font-medium text-foreground">Machine:</span> {selectedCalendarEvent.machineName}</p>
                  <p><span className="font-medium text-foreground">Time:</span> {getDayTimeLabel(selectedCalendarEvent.entry.date)}</p>
                  <p className="pt-1 text-xs leading-relaxed text-muted-foreground/90">{selectedCalendarEvent.note}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEventDetailsOpen(false)}>
              Close
            </Button>
            {selectedCalendarEvent && (
              <Button
                type="button"
                onClick={() => {
                  openScheduleDialog(
                    selectedCalendarEvent.entry.machineId,
                    selectedCalendarEvent.title,
                    selectedCalendarEvent.note,
                    selectedCalendarEvent.assignee
                  );
                  setEventDetailsOpen(false);
                }}
              >
                Edit / Reschedule
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Create a maintenance entry with an assignee and date so it appears on the calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Machine</p>
                <Select value={scheduleMachineId} onValueChange={setScheduleMachineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Maintenance Type</p>
                <Input value={scheduleType} onChange={(event) => setScheduleType(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Date</p>
                <Input type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Assignee</p>
                <Select value={scheduleAssignee} onValueChange={setScheduleAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current User">Current User</SelectItem>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                    <SelectItem value="Aisha Khan">Aisha Khan</SelectItem>
                    <SelectItem value="David Lee">David Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Note</p>
              <Textarea
                value={scheduleNote}
                onChange={(event) => setScheduleNote(event.target.value)}
                rows={4}
                placeholder="Add instructions, parts, or context for the work order..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSchedule}
              disabled={!scheduleMachineId || !scheduleType.trim() || !scheduleDate || !scheduleAssignee.trim() || !scheduleNote.trim()}
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

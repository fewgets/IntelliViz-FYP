"use client";

import { StatCard } from "@/components/cards/stat-card";
import { dashboardSummary, generateEnergyData, machines } from "@/lib/mock-data";
import { StatusDistribution } from "@/components/charts/status-distribution";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Zap,
  Gauge,
  ArrowUpDown,
  Filter,
  X,
  Download,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [key, setKey] = useState(0);

  // Force re-render/re-fetch when component mounts (e.g. navigating back)
  useEffect(() => {
    setKey(prev => prev + 1);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeFromUrl = params.get("type");
      if (typeFromUrl) {
        const t = typeFromUrl.toLowerCase();
        if (t.includes("cnc")) setTypeFilter("cnc");
        else if (t.includes("pump")) setTypeFilter("pump");
        else if (t.includes("robot")) setTypeFilter("robotic arm");
        else if (t.includes("compressor")) setTypeFilter("compressor");
      }
    }
  }, []);

  const powerAnomalies = useMemo(() => {
    const energyData = generateEnergyData();
    return energyData.filter((item) => {
      if (!item.average) return false;
      const deviation = Math.abs(item.consumption - item.average) / item.average;
      return deviation >= 0.22;
    }).length;
  }, []);

  const { machineRows, statusCounts, totalMachines } = useMemo(() => {
    const counts = { operational: 0, warning: 0, critical: 0, offline: 0 };
    
    let allMapped = machines.map((machine, index) => {
      const powerDraw = machine.sensors.find((sensor) => sensor.type === "power")?.value ?? 0;
      const runningHours = Math.round((machine.uptime / 100) * 24);
      const idleHours = Math.max(0, 24 - runningHours);
      const healthScore = Math.max(38, Math.min(99, Math.round((machine.efficiency + machine.uptime) / 2)));
      const overloaded = machine.status === "critical" || powerDraw > 78 || runningHours > 19;

      counts[machine.status as keyof typeof counts]++;

      return {
        key: `${machine.id}-${index}`,
        id: machine.id,
        name: machine.name,
        type: machine.type,
        status: machine.status,
        runningHours,
        idleHours,
        powerDraw: Number(powerDraw.toFixed(1)),
        healthScore,
        overloaded,
      };
    });

    // Filter by status
    let filtered = allMapped;
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => {
        const t = m.type.toLowerCase();
        const n = m.name.toLowerCase();
        const tf = typeFilter.toLowerCase();
        return t.includes(tf) || n.includes(tf);
      });
    }

    return {
      machineRows: filtered,
      statusCounts: counts,
      totalMachines: machines.length
    };
  }, [statusFilter, typeFilter]);

  const handleSliceClick = (status: string) => {
    setStatusFilter(prev => prev === status ? "all" : status);
  };

  return (
    <div suppressHydrationWarning className="-mt-1 space-y-1 sm:-mt-2 sm:space-y-2 lg:-mt-3 lg:space-y-3">
      {/* KPI Cards - Mobile Friendly Grid (2 cols on mobile, 5 on desktop) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        <Link
          href="/machines"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Open active machines"
        >
          <StatCard
            title="Active Machines"
            value={`${dashboardSummary.activeMachines}/${dashboardSummary.totalMachines}`}
            subtitle="Running / Total"
            icon={Activity}
            trend={{ value: 2.5, isPositive: true }}
            variant="success"
            className="h-full rounded-md cursor-pointer"
          />
        </Link>
        <Link
          href="/machines"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Open faulty machines"
        >
          <StatCard
            title="Faulty"
            value={dashboardSummary.faultyMachines}
            subtitle="Attention"
            icon={AlertTriangle}
            variant="critical"
            className="h-full rounded-md cursor-pointer"
          />
        </Link>
        <Link
          href="/anomalies?focus=power"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Open power anomaly overview"
        >
          <StatCard
            title="Anomalies"
            value={powerAnomalies}
            subtitle="Power anomalies"
            icon={AlertTriangle}
            variant="critical"
            className="h-full rounded-md cursor-pointer"
          />
        </Link>
        <Link
          href="/system-health"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Open system health score"
        >
          <StatCard
            title="Health Score"
            value={`${dashboardSummary.systemHealth}%`}
            subtitle="Open health details"
            icon={Gauge}
            variant="default"
            className="h-full rounded-md cursor-pointer"
          />
        </Link>
        <Link
          href="/energy"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label="Open energy overview"
        >
          <StatCard
            title="Energy"
            value={`${dashboardSummary.energyConsumption}`}
            subtitle="kWh"
            icon={Zap}
            trend={{ value: 3.1, isPositive: false }}
            variant="warning"
            className="h-full rounded-md cursor-pointer"
          />
        </Link>
      </div>

      {/* Fleet Overview (Left) & Fleet Status Graph (Right) */}
      <section className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="relative rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md shadow-2xl sm:p-6 flex-1">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
          
          <div className="mb-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-foreground/90">Fleet Overview</h2>
              <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 border border-success/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-success">Live</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px] text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] text-xs sm:text-sm">
                    <SelectValue placeholder="Machine Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cnc">CNC</SelectItem>
                    <SelectItem value="pump">Pump</SelectItem>
                    <SelectItem value="robotic arm">Robotic Arm</SelectItem>
                    <SelectItem value="compressor">Compressor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csvRows = [
                    ["Machine", "ID", "Type", "Status", "Idle Time", "Running Time", "Power Draw", "Health Score"],
                    ...machineRows.map(row => [
                      row.name,
                      row.id,
                      row.type,
                      row.status,
                      `${row.idleHours}h`,
                      `${row.runningHours}h`,
                      `${row.powerDraw}kW`,
                      `${row.healthScore}%`
                    ])
                  ];
                  const csvContent = csvRows.map(e => e.join(",")).join("\n");
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute("download", "machine_report.csv");
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="gap-1.5 text-xs ml-auto sm:ml-0"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              {(statusFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="gap-1.5 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-muted/45">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90">
                  <th className="px-3 py-1.5">Machine</th>
                  <th className="px-3 py-1.5">Status</th>
                  <th className="px-3 py-1.5">Operation</th>
                  <th className="px-3 py-1.5">Power Draw</th>
                  <th className="px-3 py-1.5">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {machineRows.map((row) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "transition-colors hover:bg-muted/40 cursor-pointer",
                      row.status === "operational" && !row.overloaded && "hover:bg-success/5",
                      row.status === "warning" && "hover:bg-warning/5",
                      (row.status === "critical" || row.overloaded) && "hover:bg-critical/5",
                      row.status === "offline" && "hover:bg-muted/20"
                    )}
                    onClick={() => window.location.href = `/machines/${row.id}`}
                  >
                    <td className="px-3 py-1.5">
                      <Link href={`/machines/${row.id}`} className="hover:text-primary">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{row.name}</p>
                          <span className="text-[10px] text-muted-foreground/60 font-mono">#{row.id.slice(-4)}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          row.status === "operational" && "bg-success/10 text-success",
                          row.status === "warning" && "bg-warning/10 text-warning",
                          row.status === "critical" && "bg-critical/10 text-critical",
                          row.status === "offline" && "bg-muted/10 text-muted-foreground"
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-col justify-center">
                        <span className={cn("text-xs font-bold", row.runningHours > 19 ? "text-critical" : "text-foreground")}>
                          {row.runningHours > 0 ? "Normal" : "Idle"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {row.runningHours > 0 ? `${row.runningHours}h running` : `${row.idleHours}h idle`}
                        </span>
                      </div>
                    </td>
                    <td className={cn("px-3 py-1.5 text-xs font-bold", row.powerDraw > 78 ? "text-critical" : "text-foreground")}>
                      {row.powerDraw} <span className="text-[10px] font-normal text-muted-foreground">kW</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={cn(
                          "text-xs font-black",
                          row.healthScore >= 88 ? "text-success" : row.healthScore >= 70 ? "text-warning" : "text-critical"
                        )}
                      >
                        {row.healthScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="md:hidden divide-y divide-border/30">
            {machineRows.map((row) => (
              <div key={row.key} className="p-4 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => window.location.href = `/machines/${row.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/machines/${row.id}`} className="hover:text-primary">
                    <p className="font-semibold text-foreground text-sm">{row.name}</p>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">#{row.id.slice(-4)}</span>
                  </Link>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      row.status === "operational" && "bg-success/10 text-success",
                      row.status === "warning" && "bg-warning/10 text-warning",
                      row.status === "critical" && "bg-critical/10 text-critical",
                      row.status === "offline" && "bg-muted/10 text-muted-foreground"
                    )}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-3">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Operation</p>
                    <p className={cn("font-bold", row.runningHours > 19 ? "text-critical" : "text-foreground")}>
                      {row.runningHours > 0 ? "Normal" : "Idle"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{row.runningHours > 0 ? `${row.runningHours}h running` : `${row.idleHours}h idle`}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Power</p>
                    <p className={cn("font-bold", row.powerDraw > 78 ? "text-critical" : "text-foreground")}>{row.powerDraw} kW</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Health</p>
                    <p className={cn("font-black", row.healthScore >= 88 ? "text-success" : row.healthScore >= 70 ? "text-warning" : "text-critical")}>{row.healthScore}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          <aside className="w-full lg:w-[340px] flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <StatusDistribution onSliceClick={handleSliceClick} activeFilter={statusFilter} />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

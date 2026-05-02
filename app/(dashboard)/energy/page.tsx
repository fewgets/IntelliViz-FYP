"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateEnergyData, machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Battery,
  Factory,
  AlertTriangle,
  Download,
  Sparkles,
  Cpu,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const AnomalyChart = dynamic(
  () => import("@/components/charts/anomaly-chart").then((m) => m.AnomalyChart),
  { ssr: false, loading: () => <div className="h-[340px] animate-pulse rounded-xl bg-card/40 border border-white/10 backdrop-blur-md" /> }
);

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function seededValue(index: number, offset: number, min: number, max: number) {
  const normalized = (Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453) % 1;
  const value = Math.abs(normalized);
  return Math.round(min + value * (max - min));
}

const energyGlowColors = {
  critical: "color-mix(in oklch, var(--critical), transparent 82%)",
  warning: "color-mix(in oklch, var(--warning), transparent 82%)",
  primary: "color-mix(in oklch, var(--primary), transparent 82%)",
  success: "color-mix(in oklch, var(--success), transparent 82%)",
} as const;

function EnergySnapshotCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof energyGlowColors;
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
          backgroundImage: `radial-gradient(circle at ${pointerPosition.x}px ${pointerPosition.y}px, ${energyGlowColors[tone]}, transparent 70%)`,
        }}
      />
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${tone === "critical" ? "via-critical/50" : tone === "warning" ? "via-warning/50" : tone === "success" ? "via-success/50" : "via-primary/50"} to-transparent`} />
      <CardContent className="flex items-center gap-3 p-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone === "critical" ? "border-critical/20 bg-critical/10" : tone === "warning" ? "border-warning/20 bg-warning/10" : tone === "success" ? "border-success/20 bg-success/10" : "border-primary/20 bg-primary/10"} shadow-inner`}>
          <Icon className={`h-4 w-4 ${tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary"}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className={`text-xl font-bold tracking-tight mt-0.5 ${tone === "critical" ? "text-critical" : tone === "success" ? "text-success" : "text-foreground"}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OptimizationItem({ suggestion, index }: { suggestion: any, index: number }) {
  const Icon = suggestion.icon;
  const [status, setStatus] = useState(suggestion.status);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    if (status === "Active" || isApplying) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setStatus("Active");
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10"
    >
      <div className="flex items-start sm:items-center gap-4 flex-1">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-inner ${
          suggestion.priority === "high" ? "bg-critical/10 border-critical/20 text-critical" :
          suggestion.priority === "medium" ? "bg-warning/10 border-warning/20 text-warning" :
          "bg-primary/10 border-primary/20 text-primary"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-bold text-sm tracking-tight">{suggestion.title}</h4>
            {status === "Active" ? (
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-black px-1.5 h-4 bg-success/10 text-success border-success/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-black px-1.5 h-4 text-muted-foreground">
                {status}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0 pl-14 sm:pl-0">
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-0.5">Est. Savings</p>
          <p className="text-base font-black text-success tracking-tight">{suggestion.savings}</p>
        </div>
        <Button 
          variant={status === "Active" ? "outline" : "default"}
          size="sm" 
          onClick={handleApply}
          disabled={isApplying}
          className={cn(
            "h-8 text-[10px] font-bold uppercase tracking-widest px-4 w-28",
            status === "Active" && "border-white/10 bg-white/5 hover:bg-white/10 text-foreground",
            status !== "Active" && "shadow-lg shadow-primary/20"
          )}
        >
          {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "Active" ? "Configure" : "Apply"}
        </Button>
      </div>
    </motion.div>
  );
}

export default function EnergyPage() {
  const energyData = useMemo(() => generateEnergyData(), []);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const totalConsumption = energyData.reduce((acc, d) => acc + d.consumption, 0);
  const peakConsumption = Math.max(...energyData.map((d) => d.consumption));
  const avgConsumption = totalConsumption / energyData.length;
  const costPerKwh = 0.12;
  const estimatedDailyCost = (totalConsumption * costPerKwh).toFixed(2);

  const machineEnergyData = useMemo(() => {
    return machines
      .map((m) => ({
        name: m.name.split(" ")[0],
        consumption: seededValue(m.id.length, m.efficiency, 50, 250),
        efficiency: m.efficiency,
      }))
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5);
  }, []);

  const potentialSavings = (estimatedDailyCost * 0.15).toFixed(2); // Assuming 15% optimization potential

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      className="-mt-3 sm:-mt-4 lg:-mt-5 route-accent-energy"
      onMouseMove={handleMouseMove}
      style={{
        // @ts-ignore
        "--mouse-x": `${mousePosition.x}px`,
        "--mouse-y": `${mousePosition.y}px`,
      }}
    >
      {/* ABOVE THE FOLD HERO SECTION */}
      <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[500px] mb-4 gap-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight">
            Power Management
            <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-success font-bold mt-[1px]">Live</span>
            </div>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time power tracking, anomaly detection, and AI optimization
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-white/10 bg-card/40 backdrop-blur-md shadow-lg px-3"
            onClick={() => {
              const csvRows = [
                ["Timestamp", "Consumption (kW)", "Peak (kW)", "Average (kW)"],
                ...energyData.map(row => [
                  new Date(row.timestamp).toLocaleTimeString(),
                  row.consumption,
                  row.peak,
                  row.average,
                ])
              ];
              const csvContent = csvRows.map(e => e.join(",")).join("\n");
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "energy_report.csv";
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-8 text-xs shadow-lg shadow-warning/20 bg-warning text-warning-foreground hover:bg-warning/90 px-3">
            <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
            Optimization Settings
          </Button>
        </div>
      </motion.div>

      <div className="grid flex-shrink-0 gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 h-[72px]">
        <EnergySnapshotCard title="Total Today" value={`${(totalConsumption / 1000).toFixed(1)} MWh`} icon={Zap} tone="primary" />
        <EnergySnapshotCard title="Peak Consumption" value={`${peakConsumption} kW`} icon={TrendingUp} tone="critical" />
        <EnergySnapshotCard title="Potential Savings" value={`$${potentialSavings}`} icon={Lightbulb} tone="warning" />
        <EnergySnapshotCard title="Est. Daily Cost" value={`$${estimatedDailyCost}`} icon={TrendingDown} tone="success" />
      </div>

      {/* Power Analytics Grid */}
      <div className="flex-1 grid gap-3 lg:grid-cols-3 lg:gap-4 min-h-0">
        {/* Anomaly Detection */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <LazyMount minHeight="100%" className="h-full flex-1 min-h-0">
            <AnomalyChart />
          </LazyMount>
        </div>

        {/* Machine Energy Consumption */}
        <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl h-full flex flex-col min-h-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground/90">
              <Factory className="h-5 w-5 text-primary" />
              Machine Draw
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold">24h</Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 px-2 pb-2 custom-scrollbar">
            <div className="h-full min-h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineEnergyData} layout="vertical" margin={{ left: 0, right: 10, bottom: 0, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={85}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/10 bg-card/90 p-3 shadow-2xl backdrop-blur-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{data.name}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              Consumption: <span className="font-bold text-primary">{data.consumption} kW</span>
                            </p>
                            <p className="text-sm">
                              Daily Cost: <span className="font-bold text-warning">${(data.consumption * 24 * 0.12).toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="consumption" radius={[0, 4, 4, 0]}>
                    {machineEnergyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? "var(--critical)" : "var(--primary)"} 
                        className={index === 0 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* BELOW THE FOLD SECTIONS */}
      <div className="space-y-6 sm:space-y-8">
      <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground/90">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Active AI Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Shift Peak Load",
                description: "Move non-critical operations to off-peak hours (10PM - 6AM)",
                savings: "12%",
                priority: "high",
                icon: Cpu,
                status: "Pending Approval",
              },
              {
                title: "Optimize HVAC",
                description: "Reduce cooling during non-operational hours automatically",
                savings: "8%",
                priority: "medium",
                icon: TrendingDown,
                status: "Active",
              },
              {
                title: "Motor Efficiency",
                description: "Replace aging motors in Conveyor Line with VFD units",
                savings: "15%",
                priority: "high",
                icon: Zap,
                status: "Pending Action",
              },
              {
                title: "Lighting Control",
                description: "Implement occupancy-based lighting in storage areas",
                savings: "5%",
                priority: "low",
                icon: Lightbulb,
                status: "Active",
              },
            ].map((suggestion, index) => (
              <OptimizationItem key={index} suggestion={suggestion} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function LazyMount({
  children,
  minHeight,
  className,
}: {
  children: React.ReactNode;
  minHeight: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px" }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : <div className="animate-pulse rounded-xl bg-muted/40" style={{ minHeight }} />}
    </div>
  );
}

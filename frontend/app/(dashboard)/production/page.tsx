"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productionKPI, machines } from "@/lib/mock-data";
import { KPITrends } from "@/components/charts/kpi-trends";
import { WeeklyOverview } from "@/components/charts/weekly-overview";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  Activity,
  Gauge,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function seededValue(index: number, offset: number, min: number, max: number) {
  const raw = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
  const fraction = raw - Math.floor(raw);
  return Math.round(min + Math.abs(fraction) * (max - min));
}

export default function ProductionPage() {
  // Generate production trends
  const productionTrends = useMemo(() => {
    const data = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date(2026, 3, 14);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString([], { weekday: "short" }),
        oee: seededValue(i, 1, 80, 95),
        output: seededValue(i, 2, 3000, 3500),
        downtime: seededValue(i, 3, 20, 80),
      });
    }
    return data;
  }, []);

  // OEE breakdown for radial chart
  const oeeBreakdown = [
    { name: "Quality", value: productionKPI.quality, fill: "oklch(0.7 0.2 145)" },
    { name: "Performance", value: productionKPI.performance, fill: "oklch(0.75 0.18 195)" },
    { name: "Availability", value: productionKPI.availability, fill: "oklch(0.8 0.18 85)" },
  ];

  // Hourly output data
  const hourlyOutput = useMemo(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      const isWorkHour = i >= 6 && i <= 22;
      const outputValue = isWorkHour
        ? seededValue(i, 4, 120, 160)
        : seededValue(i, 5, 0, 20);
      data.push({
        hour: `${i}:00`,
        output: outputValue,
        target: isWorkHour ? 150 : 0,
      });
    }
    return data;
  }, []);

  return (
    <div className="space-y-6 route-accent-production">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production KPIs</h1>
          <p className="text-muted-foreground">
            Overall Equipment Effectiveness & Performance Metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Set Targets</Button>
        </div>
      </motion.div>

      {/* OEE Score */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Overall Equipment Effectiveness</p>
            <div className="relative mt-4">
              <svg className="h-40 w-40 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="stroke-primary"
                  initial={{ strokeDasharray: 440, strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (productionKPI.oee / 100) * 440 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{productionKPI.oee}%</span>
                <span className="text-sm text-muted-foreground">OEE</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "mt-4",
                productionKPI.oee >= 85
                  ? "bg-success/10 text-success"
                  : productionKPI.oee >= 70
                  ? "bg-warning/10 text-warning"
                  : "bg-critical/10 text-critical"
              )}
            >
              {productionKPI.oee >= 85 ? "World Class" : productionKPI.oee >= 70 ? "Average" : "Below Target"}
            </Badge>
          </CardContent>
        </Card>

        {/* OEE Components */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">OEE Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  label: "Availability",
                  value: productionKPI.availability,
                  target: 95,
                  icon: Clock,
                  description: "Planned vs Actual Running Time",
                },
                {
                  label: "Performance",
                  value: productionKPI.performance,
                  target: 95,
                  icon: Gauge,
                  description: "Actual vs Ideal Cycle Time",
                },
                {
                  label: "Quality",
                  value: productionKPI.quality,
                  target: 99,
                  icon: CheckCircle2,
                  description: "Good Units vs Total Units",
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <metric.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{metric.label}</span>
                    </div>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        metric.value >= metric.target
                          ? "text-success"
                          : metric.value >= metric.target * 0.9
                          ? "text-warning"
                          : "text-critical"
                      )}
                    >
                      {metric.value}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{metric.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Target: {metric.target}%</span>
                      <span
                        className={
                          metric.value >= metric.target ? "text-success" : "text-critical"
                        }
                      >
                        {metric.value >= metric.target ? (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            On Target
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {(metric.target - metric.value).toFixed(1)}% below
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          metric.value >= metric.target
                            ? "bg-success"
                            : metric.value >= metric.target * 0.9
                            ? "bg-warning"
                            : "bg-critical"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Output/Hour</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{productionKPI.outputPerHour}</p>
                <span className="text-sm text-muted-foreground">/ {productionKPI.target} target</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-critical/10">
              <Timer className="h-6 w-6 text-critical" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Downtime Today</p>
              <p className="text-2xl font-bold">{productionKPI.downtime} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Good Units</p>
              <p className="text-2xl font-bold">3,412</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <XCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected Units</p>
              <p className="text-2xl font-bold">62</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Trends & Weekly Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <KPITrends />
        <WeeklyOverview />
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Output</TabsTrigger>
          <TabsTrigger value="comparison">Machine Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">7-Day Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionTrends}>
                    <defs>
                      <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                            <p className="font-medium">{data.date}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="text-primary">OEE:</span>{" "}
                                <span className="font-medium">{data.oee}%</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-success">Output:</span>{" "}
                                <span className="font-medium">{data.output} units</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-critical">Downtime:</span>{" "}
                                <span className="font-medium">{data.downtime} min</span>
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="oee"
                      stroke="oklch(0.75 0.18 195)"
                      strokeWidth={2}
                      fill="url(#colorOee)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hourly Production Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyOutput}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "currentColor", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                            <p className="font-medium">{data.hour}</p>
                            <p className="text-sm">
                              Output: <span className="font-medium">{data.output} units</span>
                            </p>
                            <p className="text-sm">
                              Target: <span className="font-medium">{data.target} units</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="output" fill="oklch(0.75 0.18 195)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="oklch(0.3 0.01 240)" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Machine Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {machines.map((machine, index) => (
                  <motion.div
                    key={machine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="w-48">
                      <p className="font-medium">{machine.name}</p>
                      <p className="text-xs text-muted-foreground">{machine.id}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-medium">{machine.efficiency}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            machine.efficiency >= 90
                              ? "bg-success"
                              : machine.efficiency >= 70
                              ? "bg-warning"
                              : "bg-critical"
                          )}
                          style={{ width: `${machine.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          machine.status === "operational"
                            ? "bg-success/10 text-success"
                            : machine.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-critical/10 text-critical"
                        )}
                      >
                        {machine.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

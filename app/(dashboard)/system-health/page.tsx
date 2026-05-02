"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  Wrench,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { dashboardSummary, machines } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SystemHealthPage() {
  const router = useRouter();

  const healthMetrics = {
    total: machines.length,
    active: machines.filter((m) => m.status === "operational").length,
    warning: machines.filter((m) => m.status === "warning").length,
    critical: machines.filter((m) => m.status === "critical").length,
    idle: machines.filter((m) => m.status === "offline").length,
    score: dashboardSummary.systemHealth,
    efficiency: dashboardSummary.productionEfficiency,
    energyHealth: 85,
    uptime: 99.2,
  };

  const systemStatus = (() => {
    const score = healthMetrics.score;
    if (score >= 90) return { label: "Excellent", color: "text-success", bg: "bg-success/10" };
    if (score >= 70) return { label: "Good", color: "text-warning", bg: "bg-warning/10" };
    if (score >= 50) return { label: "Fair", color: "text-critical", bg: "bg-critical/10" };
    return { label: "Critical", color: "text-critical", bg: "bg-critical/10" };
  })();

  const machineBreakdown = [
    { label: "Active/Running", value: healthMetrics.active, icon: Activity, color: "text-success", bgColor: "bg-success/10" },
    { label: "Warning Status", value: healthMetrics.warning, icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10" },
    { label: "Critical/Offline", value: healthMetrics.critical, icon: Wrench, color: "text-critical", bgColor: "bg-critical/10" },
    { label: "Idle", value: healthMetrics.idle, icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted/10" },
  ];

  const systemComponents = [
    { name: "Production Efficiency", value: healthMetrics.efficiency, unit: "%", status: "Optimal", icon: TrendingUp, color: "success" },
    { name: "Energy Management", value: healthMetrics.energyHealth, unit: "%", status: "Good", icon: Zap, color: "warning" },
    { name: "System Uptime", value: healthMetrics.uptime, unit: "%", status: "Excellent", icon: CheckCircle, color: "success" },
    { name: "Maintenance Status", value: 95, unit: "%", status: "", icon: Wrench, color: "success" },
  ];

  const recommendations = [
    {
      priority: "High",
      title: "Review Critical Machines",
      description: `${healthMetrics.critical} machine(s) require immediate attention`,
      action: "Investigate now",
    },
    {
      priority: "Medium",
      title: "Schedule Preventive Maintenance",
      description: `${healthMetrics.warning} machine(s) showing warning signs`,
      action: "Plan maintenance",
    },
    {
      priority: "Low",
      title: "Optimize Energy Usage",
      description: "Peak usage periods detected, consider load balancing",
      action: "Review trends",
    },
  ];

  return (
    <div className="space-y-6 route-accent-security">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="heading-kicker">System monitoring</p>
          <h1 className="heading-display text-2xl font-bold tracking-tight sm:text-3xl">System Health Report</h1>
          <p className="text-sm text-muted-foreground">Complete system status and performance metrics</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Overall Health Card */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={systemStatus.color}
                    strokeDasharray={`${(healthMetrics.score / 100) * 376.99} 376.99`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${systemStatus.color}`}>{healthMetrics.score}%</span>
                  <span className="text-xs text-muted-foreground">Overall</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className={`mt-1 inline-block rounded-full px-4 py-2 text-sm font-medium ${systemStatus.bg} ${systemStatus.color}`}>
                  {systemStatus.label}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Machines</p>
                  <p className="text-2xl font-bold">{healthMetrics.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Machine Status Breakdown */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {machineBreakdown.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <Card key={idx} className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <div className={`rounded-lg ${item.bgColor} p-2`}>
                      <IconComponent className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {((item.value / healthMetrics.total) * 100).toFixed(0)}% of total
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Components Performance */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">System Components</CardTitle>
          <p className="text-xs text-muted-foreground">Performance metrics for key system areas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemComponents.map((comp, idx) => {
              const IconComponent = comp.icon;
              const colorMap: Record<string, string> = {
                success: "bg-success/10 text-success",
                warning: "bg-warning/10 text-warning",
                critical: "bg-critical/10 text-critical",
              };
              return (
                <div key={idx} className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/40 p-3">
                  <div className={`rounded-lg ${colorMap[comp.color]} p-2`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{comp.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted/40">
                        <div
                          className={`h-full rounded-full ${comp.color === "success" ? "bg-success" : comp.color === "warning" ? "bg-warning" : "bg-critical"}`}
                          style={{ width: `${comp.value}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{comp.value}{comp.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Recommended Actions</CardTitle>
          <p className="text-xs text-muted-foreground">Priority-based improvement suggestions</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto pr-2">
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 rounded-lg border border-border/50 bg-background/40 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          rec.priority === "High"
                            ? "bg-critical/10 text-critical"
                            : rec.priority === "Medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                    <button className="w-fit text-xs font-medium text-primary hover:underline mt-1">
                      {rec.action} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Machine Status Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-2">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 sticky top-0 bg-background/60">
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Machine ID</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-2 font-medium">{machine.id}</td>
                    <td className="py-2 px-2 text-muted-foreground">{machine.type}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          machine.status === "operational"
                            ? "bg-success/10 text-success"
                            : machine.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : machine.status === "critical" || machine.status === "offline"
                            ? "bg-critical/10 text-critical"
                            : "bg-muted/10 text-muted-foreground"
                        }`}
                      >
                        {machine.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">{machine.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

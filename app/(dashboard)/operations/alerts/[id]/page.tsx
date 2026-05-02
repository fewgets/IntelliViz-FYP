"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, AlertTriangle, Check, Clock, X, User, Zap, TrendingUp } from "lucide-react";
import { alerts, generateAnomalyData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AIResultPayload } from "@/types";

type AlertStatus = "pending" | "assigned" | "in-progress" | "resolved" | "dismissed";
type NoteEntry = { id: number; text: string; author: string; createdAt: string };

const FALLBACK_USER_NAME = "Admin User";

const statusConfig: Record<AlertStatus, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "bg-warning/10 text-warning", icon: <Clock className="h-4 w-4" />, label: "Pending" },
  assigned: { color: "bg-info/10 text-info", icon: <User className="h-4 w-4" />, label: "Assigned" },
  "in-progress": { color: "bg-primary/10 text-primary", icon: <AlertTriangle className="h-4 w-4" />, label: "In Progress" },
  resolved: { color: "bg-success/10 text-success", icon: <Check className="h-4 w-4" />, label: "Resolved" },
  dismissed: { color: "bg-muted/10 text-muted-foreground", icon: <X className="h-4 w-4" />, label: "Dismissed" },
};

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [status, setStatus] = useState<AlertStatus>("pending");
  const [assignee, setAssignee] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<NoteEntry[]>([]);

  const loggedInUserName = useMemo(() => {
    if (typeof window === "undefined") return FALLBACK_USER_NAME;
    return window.localStorage.getItem("intelliviz-user-name")?.trim() || FALLBACK_USER_NAME;
  }, []);

  const alert = useMemo(() => {
    return alerts.find((a) => a.id === id);
  }, [id]);

  // Get anomaly data
  const data = useMemo(() => generateAnomalyData(), []);

  // Find corresponding anomaly (closest to alert timestamp)
  const anomaly = useMemo(() => {
    if (!alert) return null;
    const alertTime = new Date(alert.timestamp).getTime();
    let closest = null;
    let minDiff = Infinity;
    
    for (const item of data) {
      if (!item.isAnomaly) continue;
      const itemTime = new Date(item.timestamp).getTime();
      const diff = Math.abs(itemTime - alertTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    return closest;
  }, [alert, data]);

  // Get context data (24 hours before and after)
  const contextData = useMemo(() => {
    if (!anomaly) return [];
    
    const anomalyTime = new Date(anomaly.timestamp).getTime();
    const contextWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    return data.filter((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      const diff = Math.abs(itemTime - anomalyTime);
      return diff <= contextWindow;
    });
  }, [data, anomaly]);

  // Prepare chart data with labels
  const chartData = useMemo(() => {
    return contextData.map((item) => {
      const date = new Date(item.timestamp);
      return {
        ...item,
        axisLabel: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fullLabel: date.toLocaleString(),
        isTarget: item.timestamp === anomaly?.timestamp,
      };
    });
  }, [contextData, anomaly]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!anomaly) return null;

    const beforeAnomalies = contextData.filter(
      (item) =>
        item.isAnomaly &&
        new Date(item.timestamp).getTime() < new Date(anomaly.timestamp).getTime()
    ).length;

    const afterAnomalies = contextData.filter(
      (item) =>
        item.isAnomaly &&
        new Date(item.timestamp).getTime() > new Date(anomaly.timestamp).getTime()
    ).length;

    const avgValueContext = contextData.reduce((sum, item) => sum + item.value, 0) / contextData.length;

    const delta = anomaly.value - anomaly.predicted;
    const percentDelta = (delta / anomaly.predicted) * 100;

    return {
      delta,
      percentDelta,
      beforeAnomalies,
      afterAnomalies,
      avgValueContext: Math.round(avgValueContext * 10) / 10,
    };
  }, [anomaly, contextData]);

  const severity = useMemo(() => {
    if (!anomaly || !stats) return "Info";
    const absDelta = Math.abs(stats.delta);
    return absDelta >= 18 ? "Critical" : absDelta >= 10 ? "Warning" : "Info";
  }, [anomaly, stats]);

  const possibleCauses = useMemo(() => {
    if (!stats) return [];
    
    const causes: string[] = [];
    
    if (Math.abs(stats.percentDelta) > 50) {
      causes.push("Significant deviation from predicted baseline");
    }
    if (stats.delta > 0) {
      causes.push("Higher than expected output/reading");
    } else {
      causes.push("Lower than expected output/reading");
    }
    if (stats.beforeAnomalies > 0 || stats.afterAnomalies > 0) {
      causes.push("Clustered anomalies suggest systemic issue");
    }
    if (stats.avgValueContext > 60) {
      causes.push("Operating at elevated levels");
    }
    
    return causes.length > 0 ? causes : ["Unexpected deviation in normal pattern"];
  }, [stats]);

  const aiResult = useMemo<AIResultPayload | null>(() => {
    if (!anomaly || !stats) return null;

    const riskScore = Math.min(
      100,
      Math.round(Math.abs(stats.percentDelta) + (stats.beforeAnomalies + stats.afterAnomalies) * 8)
    );
    const confidence = Math.max(58, Math.min(98, Math.round(94 - Math.abs(stats.delta) * 1.6)));
    const alertLevel = riskScore >= 75 ? "critical" : riskScore >= 45 ? "warning" : "info";

    return (
      alert.aiResult ?? {
        predictionType: stats.delta >= 0 ? "Overload / Overheat trend" : "Underperformance trend",
        riskScore,
        confidence,
        alertLevel,
        rootCause: possibleCauses[0] ?? "Unexpected deviation in normal pattern",
        aiRecommendation:
          alert.suggestedAction ??
          "Prioritize focused diagnostic checks around this alert timestamp.",
      }
    );
  }, [alert, anomaly, stats, possibleCauses]);

  const formatStableTime = (value: number | string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(new Date(value));

  const alertBaseTime = new Date(alert.timestamp).getTime();

  const timeline = [
    { time: formatStableTime(alertBaseTime), action: "Alert triggered", details: "Anomaly detected on machine" },
    { time: formatStableTime(alertBaseTime + 60 * 1000), action: "Status: Pending", details: "Waiting for assignment" },
    { time: formatStableTime(alertBaseTime + 2 * 60 * 1000), action: "Status: Assigned", details: `Assigned to ${assignee || "unassigned"}` },
  ];

  if (!alert) {
    return (
      <div className="space-y-6 route-accent-operations">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Alert not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = statusConfig[status];

  const handleAddNote = () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;

    setNotes((prev) => [
      {
        id: Date.now(),
        text: trimmed,
        author: loggedInUserName,
        createdAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setNoteInput("");
  };

  return (
    <div className="space-y-6 route-accent-operations">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="heading-kicker">Alert management</p>
          <h1 className="heading-display text-2xl font-bold tracking-tight sm:text-3xl">Alert Details</h1>
          <p className="text-sm text-muted-foreground">Complete analysis and management for operational alerts</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Main Info Cards - Technical Data */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Timestamp */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Alert Timestamp</p>
              <p className="text-sm font-semibold">{new Date(alert.timestamp).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleDateString([], { weekday: "short" })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Severity</p>
              <div className={`inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-sm font-medium ${alert.severity === "critical" ? "bg-critical/10 text-critical" : alert.severity === "warning" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"}`}>
                <AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-critical" : alert.severity === "warning" ? "text-warning" : "text-info"}`} />
                <span>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machine */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Machine</p>
              <p className="text-lg font-semibold">{alert.machineName}</p>
              <p className="text-xs text-muted-foreground">{alert.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Current Status</p>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${config.color}`}>
                {config.icon}
                {config.label}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      {anomaly && (
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base">24-Hour Context</CardTitle>
            <p className="text-xs text-muted-foreground">Actual vs predicted values with anomaly highlighted</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="detailValueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => {
                      const item = chartData.find((entry) => entry.timestamp === timestamp);
                      return item?.axisLabel ?? "";
                    }}
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                          <p className="text-xs text-muted-foreground">{point.fullLabel}</p>
                          <div className="mt-1 space-y-1 text-sm">
                            <p>Actual: <span className="font-medium">{point.value.toFixed(1)}</span></p>
                            <p>Predicted: <span className="font-medium">{point.predicted.toFixed(1)}</span></p>
                            {point.isTarget && <p className="font-semibold text-critical">← Alert Anomaly</p>}
                            {point.isAnomaly && !point.isTarget && <p className="text-xs text-warning">Related anomaly</p>}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-primary)"
                    strokeWidth={2}
                    fill="url(#detailValueGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="var(--chart-secondary)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  {chartData.map((point, index) => (
                    <ReferenceDot
                      key={`${point.timestamp}-${index}`}
                      x={point.timestamp}
                      y={point.value}
                      r={point.isTarget ? 6.5 : point.isAnomaly ? 4 : 0}
                      fill={point.isTarget ? "var(--chart-critical)" : "var(--chart-warning)"}
                      stroke={point.isTarget ? "var(--chart-critical)" : "var(--chart-warning)"}
                      strokeWidth={2}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        {/* Context Statistics */}
        <div className="space-y-6">
          {aiResult && (
            <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">AI Inference Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Prediction Type</p>
                    <p className="font-medium">{aiResult.predictionType}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Alert Level</p>
                    <p className="font-medium capitalize">{aiResult.alertLevel}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="font-medium">{aiResult.riskScore}%</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-medium">{aiResult.confidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Possible Causes */}
          {possibleCauses.length > 0 && (
            <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">Analysis & Possible Causes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto pr-2">
                  <div className="space-y-2">
                    {possibleCauses.map((cause, idx) => (
                      <div key={idx} className="flex gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                        <p className="text-sm text-foreground">{cause}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {possibleCauses.length > 0 && (
            <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Review system logs and events around <strong>{formatStableTime(alert.timestamp)}</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Check operational parameters and configuration changes during this period</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Assign to appropriate team member for investigation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>{aiResult?.aiRecommendation ?? "Document findings and update alert status"}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Management Panel */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Selection */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Change Status</p>
                <Select value={status} onValueChange={(value) => setStatus(value as AlertStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Assign To</p>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-smith">John Smith - Maintenance</SelectItem>
                    <SelectItem value="sarah-khan">Sarah Khan - Operations</SelectItem>
                    <SelectItem value="mike-johnson">Mike Johnson - Engineering</SelectItem>
                    <SelectItem value="emma-lee">Emma Lee - Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 border-t border-border/50 pt-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Alert Title</p>
                  <p className="mt-1 text-sm font-medium">{alert.title}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2 bg-success hover:bg-success/90">
                  <Check className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">Alert lifecycle and status changes</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto pr-2">
            <div className="space-y-4">
              {timeline.map((entry, idx) => (
                <div key={idx} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    {idx < timeline.length - 1 && <div className="h-12 w-0.5 bg-border/50" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.details}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Notes & Points</CardTitle>
          <p className="text-xs text-muted-foreground">Notes are tagged with the logged-in account name.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Add Note</p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add notes about this alert..."
              className="w-full min-h-[100px] rounded-lg border border-border/70 bg-background/50 p-3 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Author: {loggedInUserName}</p>
              <Button type="button" onClick={handleAddNote} className="gap-2 bg-success hover:bg-success/90">
                <Check className="h-4 w-4" />
                Add Note
              </Button>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes added yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                  <p className="text-sm text-foreground">{note.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{note.author} · {note.createdAt}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

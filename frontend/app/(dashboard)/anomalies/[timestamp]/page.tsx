"use client";

import Link from "next/link";
import { use, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, AlertTriangle, Check, Clock, X, User, Zap, TrendingUp, Sparkles, RefreshCw, Search, Lightbulb } from "lucide-react";
import { alerts, generateAnomalyData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/endpoints";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { AIResultPayload } from "@/types";

type TimeRange = "24h" | "3d" | "7d" | "30d" | "90d" | "1y";
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

export default function AnomalyDetailPage({ params }: { params: Promise<{ timestamp: string }> }) {
  const searchParams = useSearchParams();
  const { timestamp } = use(params);
  const [status, setStatus] = useState<AlertStatus>("pending");
  const [assignee, setAssignee] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [generatedRootCause, setGeneratedRootCause] = useState<string | null>(null);
  const [rootCauseGeneratedAt, setRootCauseGeneratedAt] = useState<string | null>(null);
  const [isRootCauseLoading, setIsRootCauseLoading] = useState(false);
  const [generatedRecommendation, setGeneratedRecommendation] = useState<string | null>(null);
  const [recommendationGeneratedAt, setRecommendationGeneratedAt] = useState<string | null>(null);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [showRootCause, setShowRootCause] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const timeRange = (searchParams.get("range") as TimeRange) || "7d";

  const loggedInUserName = useMemo(() => {
    if (typeof window === "undefined") return FALLBACK_USER_NAME;
    return window.localStorage.getItem("intelliviz-user-name")?.trim() || FALLBACK_USER_NAME;
  }, []);
  
  const decodedTimestamp = decodeURIComponent(timestamp);
  const data = useMemo(() => generateAnomalyData(), []);

  // Find the specific anomaly
  const anomaly = useMemo(() => {
    return data.find((item) => item.timestamp === decodedTimestamp);
  }, [data, decodedTimestamp]);

  const linkedAlert = useMemo(() => {
    if (!anomaly) return null;
    const anomalyTime = new Date(anomaly.timestamp).getTime();
    let closest = null;
    let minDiff = Infinity;

    for (const alert of alerts) {
      const alertTime = new Date(alert.timestamp).getTime();
      const diff = Math.abs(alertTime - anomalyTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = alert;
      }
    }

    return closest;
  }, [anomaly]);

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
        isTarget: item.timestamp === decodedTimestamp,
      };
    });
  }, [contextData, decodedTimestamp]);

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
    const avgPredictedContext = contextData.reduce((sum, item) => sum + item.predicted, 0) / contextData.length;

    const delta = anomaly.value - anomaly.predicted;
    const percentDelta = (delta / anomaly.predicted) * 100;

    return {
      delta,
      percentDelta,
      beforeAnomalies,
      afterAnomalies,
      avgValueContext: Math.round(avgValueContext * 10) / 10,
      avgPredictedContext: Math.round(avgPredictedContext * 10) / 10,
    };
  }, [anomaly, contextData, decodedTimestamp]);

  const severity = useMemo(() => {
    if (!anomaly || !stats) return "Info";
    const absDelta = Math.abs(stats.delta);
    return absDelta >= 18 ? "Critical" : absDelta >= 10 ? "Warning" : "Info";
  }, [anomaly, stats]);

  // Cache hydration on mount
  useEffect(() => {
    if (!decodedTimestamp) return;

    const rootCauseCacheKey = `intelliviz-anomaly-root-cause:${decodedTimestamp}`;
    const recommendationCacheKey = `intelliviz-anomaly-recommendation:${decodedTimestamp}`;

    const cachedRootCause = sessionStorage.getItem(rootCauseCacheKey);
    const cachedRecommendation = sessionStorage.getItem(recommendationCacheKey);

    if (cachedRootCause) {
      const { value, timestamp } = JSON.parse(cachedRootCause);
      setGeneratedRootCause(value);
      setRootCauseGeneratedAt(timestamp);
    }

    if (cachedRecommendation) {
      const { value, timestamp } = JSON.parse(cachedRecommendation);
      setGeneratedRecommendation(value);
      setRecommendationGeneratedAt(timestamp);
    }
  }, [decodedTimestamp]);

  useEffect(() => {
    setShowRootCause(false);
    setShowRecommendation(false);
  }, [decodedTimestamp]);

  const handleGetRootCause = async (forceRefresh = false) => {
    if (!anomaly || !stats) return;

    setShowRootCause(true);

    if (!forceRefresh && generatedRootCause) {
      return;
    }

    setIsRootCauseLoading(true);
    try {
      const response: { rootCause: string; generatedAt: string } = await apiClient.post(API_ENDPOINTS.ANOMALY_ROOT_CAUSE, {
        timestamp: decodedTimestamp,
        machineId: linkedAlert?.id,
        machineName: linkedAlert?.machineName,
        severity,
        percentDelta: stats.percentDelta,
        beforeAnomalies: stats.beforeAnomalies,
        afterAnomalies: stats.afterAnomalies,
        avgValueContext: stats.avgValueContext,
        delta: stats.delta,
      });

      setGeneratedRootCause(response.rootCause);
      setRootCauseGeneratedAt(response.generatedAt);

      // Save to sessionStorage
      const rootCauseCacheKey = `intelliviz-anomaly-root-cause:${decodedTimestamp}`;
      sessionStorage.setItem(
        rootCauseCacheKey,
        JSON.stringify({
          value: response.rootCause,
          timestamp: response.generatedAt,
        })
      );

      toast.success("Root cause analysis generated");
    } catch (error) {
      console.error("Failed to get root cause:", error);
      toast.error("Failed to generate root cause analysis");
    } finally {
      setIsRootCauseLoading(false);
    }
  };

  const handleGetRecommendation = async (forceRefresh = false) => {
    if (!anomaly || !stats || !aiResult) return;

    setShowRecommendation(true);

    if (!forceRefresh && generatedRecommendation) {
      return;
    }

    setIsRecommendationLoading(true);
    try {
      const response: { recommendation: string; generatedAt: string } = await apiClient.post(API_ENDPOINTS.ANOMALY_AI_RECOMMENDATION, {
        timestamp: decodedTimestamp,
        machineId: linkedAlert?.id,
        machineName: linkedAlert?.machineName,
        severity,
        percentDelta: stats.percentDelta,
        riskScore: aiResult.riskScore,
        confidence: aiResult.confidence,
        rootCause: generatedRootCause,
      });

      setGeneratedRecommendation(response.recommendation);
      setRecommendationGeneratedAt(response.generatedAt);

      // Save to sessionStorage
      const recommendationCacheKey = `intelliviz-anomaly-recommendation:${decodedTimestamp}`;
      sessionStorage.setItem(
        recommendationCacheKey,
        JSON.stringify({
          value: response.recommendation,
          timestamp: response.generatedAt,
        })
      );

      toast.success("AI recommendation generated");
    } catch (error) {
      console.error("Failed to get recommendation:", error);
      toast.error("Failed to generate AI recommendation");
    } finally {
      setIsRecommendationLoading(false);
    }
  };

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
      anomaly.aiResult ?? {
        predictionType: stats.delta >= 0 ? "Overload / Overheat trend" : "Underperformance trend",
        riskScore,
        confidence,
        alertLevel,
        rootCause: possibleCauses[0] ?? "Unexpected deviation in normal pattern",
        aiRecommendation:
          linkedAlert?.suggestedAction ??
          "Prioritize focused diagnostic checks around this anomaly timestamp.",
      }
    );
  }, [anomaly, stats, possibleCauses, linkedAlert]);

  if (!anomaly || !stats) {
    return (
      <div className="space-y-6 route-accent-operations">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/anomalies">
            <ArrowLeft className="h-4 w-4" />
            Back to Anomalies
          </Link>
        </Button>
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Anomaly not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = statusConfig[status];
  const machineLabel = linkedAlert?.machineName ?? "Unknown Machine";
  const entityId = linkedAlert?.id ?? `ANOM-${new Date(decodedTimestamp).getTime()}`;
  const titleLabel = linkedAlert?.title ?? "Model Deviation Event";
  const severityClass =
    severity === "Critical" ? "bg-critical/10 text-critical" :
    severity === "Warning" ? "bg-warning/10 text-warning" :
    "bg-info/10 text-info";
  const severityIconClass =
    severity === "Critical" ? "text-critical" :
    severity === "Warning" ? "text-warning" :
    "text-info";

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
    <div className="space-y-6 route-accent-operations" style={{ backgroundColor: "#F3F4F6", minHeight: "100vh", padding: "24px" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="heading-kicker">Alert management</p>
          <h1 className="heading-display text-2xl font-bold tracking-tight sm:text-3xl">Alert Details</h1>
          <p className="text-sm text-muted-foreground">Complete analysis and management for operational alerts</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/anomalies?range=${timeRange}`}>
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
              <p className="text-sm font-semibold">{new Date(anomaly.timestamp).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{new Date(anomaly.timestamp).toLocaleDateString([], { weekday: "short" })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Severity</p>
              <div className={`inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-sm font-medium ${severityClass}`}>
                <AlertTriangle className={`h-4 w-4 ${severityIconClass}`} />
                <span>{severity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machine */}
        <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Machine</p>
              <p className="text-lg font-semibold">{machineLabel}</p>
              <p className="text-xs text-muted-foreground">{entityId}</p>
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
                  tickFormatter={(labelTimestamp) => {
                    const item = chartData.find((entry) => entry.timestamp === labelTimestamp);
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
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--chart-secondary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
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

      {/* ENTERPRISE DASHBOARD GRID - AI Summary (70%) & Management (30%) */}
      <div style={{ display: "grid", gridTemplateColumns: "70% 30%", gap: "24px", marginBottom: "32px" }}>
        {/* LEFT COLUMN - AI SUMMARY (70%) */}
        {aiResult && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#D1D5DB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>AI Summary</h2>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "8px 0 0 0" }}>Real-time anomaly metrics</p>
            </div>

            {/* Summary Metrics - Vertical List */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Machine Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Machine Status</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{config.label}</span>
              </div>

              {/* Risk Score */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#FEF3C7", borderRadius: "8px", borderLeft: "4px solid #D97706" }}>
                <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Risk Score</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#D97706" }}>{aiResult.riskScore}%</span>
              </div>

              {/* Prediction */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Prediction</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827", textAlign: "right", maxWidth: "50%" }}>{aiResult.predictionType}</span>
              </div>

              {/* Confidence */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#EFF6FF", borderRadius: "8px", borderLeft: "4px solid #2563EB" }}>
                <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Confidence</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#2563EB" }}>{aiResult.confidence}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => handleGetRootCause()}
                disabled={isRootCauseLoading}
                style={{
                  backgroundColor: severity === "Warning" ? "#FCD34D" : severity === "Critical" ? "#EF4444" : "#F3F4F6",
                  color: severity === "Warning" || severity === "Critical" ? "white" : "#111827",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "10px 12px",
                  cursor: isRootCauseLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Search className="h-4 w-4" />
                {isRootCauseLoading ? "Analyzing..." : generatedRootCause ? "Show Root Cause" : "Regenerate Root Cause"}
              </button>

              <button
                onClick={() => handleGetRecommendation()}
                disabled={isRecommendationLoading}
                style={{
                  backgroundColor: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "10px 12px",
                  cursor: isRecommendationLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Lightbulb className="h-4 w-4" />
                {isRecommendationLoading ? "Generating..." : generatedRecommendation ? "Show Recommendation" : "Regenerate Recommendation"}
              </button>
            </div>

            {/* Bottom Inline Results */}
            {(showRootCause || showRecommendation) && (
              <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
                {showRootCause && (
                  <div style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px", backgroundColor: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Search className="h-4 w-4" />
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111827" }}>Root Cause Analysis</h4>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {rootCauseGeneratedAt && (
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                            Generated {new Date(rootCauseGeneratedAt).toLocaleString()}
                          </span>
                        )}
                        {generatedRootCause && (
                          <button
                            onClick={() => handleGetRootCause(true)}
                            disabled={isRootCauseLoading}
                            style={{
                              backgroundColor: "#0284C7",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: isRootCauseLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            Regenerate
                          </button>
                        )}
                        <button
                          onClick={() => setShowRootCause(false)}
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#374151",
                            border: "1px solid #D1D5DB",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    {generatedRootCause ? (
                      <p style={{ margin: 0, fontSize: "14px", color: "#111827", lineHeight: "1.6" }}>{generatedRootCause}</p>
                    ) : (
                      <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
                        {isRootCauseLoading ? "Generating root cause..." : "Root cause generate nahi ho saka. Dobara try karein."}
                      </p>
                    )}
                  </div>
                )}

                {showRecommendation && (
                  <div style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px", backgroundColor: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Lightbulb className="h-4 w-4" />
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#111827" }}>AI Recommendation</h4>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {recommendationGeneratedAt && (
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                            Generated {new Date(recommendationGeneratedAt).toLocaleString()}
                          </span>
                        )}
                        {generatedRecommendation && (
                          <button
                            onClick={() => handleGetRecommendation(true)}
                            disabled={isRecommendationLoading}
                            style={{
                              backgroundColor: "#16A34A",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: isRecommendationLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            Regenerate
                          </button>
                        )}
                        <button
                          onClick={() => setShowRecommendation(false)}
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#374151",
                            border: "1px solid #D1D5DB",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    {generatedRecommendation ? (
                      <p style={{ margin: 0, fontSize: "14px", color: "#111827", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                        {generatedRecommendation}
                      </p>
                    ) : (
                      <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
                        {isRecommendationLoading ? "Generating recommendation..." : "Recommendation generate nahi ho saki. Dobara try karein."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN - MANAGEMENT CARD */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "#D1D5DB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.borderColor = "#E5E7EB";
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>Alert Management</h2>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "8px 0 0 0" }}>Control status and assignment</p>
          </div>

          {/* Status Section */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as AlertStatus)}>
              <SelectTrigger
                style={{
                  width: "100%",
                  height: "40px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  backgroundColor: "#FFFFFF",
                }}
              >
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

          {/* Assignee Section */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>Assign To</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger
                style={{
                  width: "100%",
                  height: "40px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  backgroundColor: "#FFFFFF",
                }}
              >
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

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "24px 0" }} />

          {/* Alert Title */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Alert Title</p>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: 0, lineHeight: "1.4" }}>{titleLabel}</p>
          </div>

          {/* Save Button */}
          <Button
            style={{
              width: "100%",
              height: "40px",
              backgroundColor: "#16A34A",
              color: "white",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#15803D";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#16A34A";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Check className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

      </div>

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

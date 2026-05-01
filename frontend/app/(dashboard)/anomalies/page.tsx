"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { generateAnomalyData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { AIResultPayload } from "@/types";

type TimeRange = "24h" | "3d" | "7d" | "30d" | "90d" | "1y";

const RANGE_HOURS: Record<TimeRange, number> = {
  "24h": 24,
  "3d": 72,
  "7d": 168,
  "30d": 720,
  "90d": 2160,
  "1y": 8760,
};

const VALID_RANGES: TimeRange[] = ["24h", "3d", "7d", "30d", "90d", "1y"];

function isRange(value: string | null): value is TimeRange {
  return !!value && VALID_RANGES.includes(value as TimeRange);
}

export default function AnomaliesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRange = isRange(searchParams.get("range")) ? (searchParams.get("range") as TimeRange) : "7d";
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  const data = useMemo(() => generateAnomalyData(), []);

  const filteredData = useMemo(() => {
    const selectedHours = RANGE_HOURS[timeRange];
    const latestTimestamp = data.length
      ? new Date(data[data.length - 1].timestamp).getTime()
      : Date.now();
    const cutoff = latestTimestamp - selectedHours * 60 * 60 * 1000;
    return data.filter((item) => new Date(item.timestamp).getTime() >= cutoff);
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    return filteredData.map((item) => {
      const date = new Date(item.timestamp);
      return {
        ...item,
        axisLabel:
          timeRange === "24h"
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : timeRange === "1y"
            ? date.toLocaleDateString([], { month: "short" })
            : date.toLocaleDateString([], { month: "short", day: "numeric" }),
        fullLabel: date.toLocaleString(),
      };
    });
  }, [filteredData, timeRange]);

  const anomalies = useMemo(() => {
    return chartData
      .filter((item) => item.isAnomaly)
      .map((item) => {
        const delta = item.value - item.predicted;
        const absDelta = Math.abs(delta);
        const level = absDelta >= 18 ? "Critical" : absDelta >= 10 ? "Warning" : "Info";
        const riskScore = Math.min(100, Math.round(absDelta * 4.5));
        const confidence = Math.max(60, Math.min(98, Math.round(96 - absDelta * 1.4)));
        const alertLevel = riskScore >= 75 ? "critical" : riskScore >= 45 ? "warning" : "info";
        const aiResult: AIResultPayload =
          item.aiResult ?? {
            predictionType: delta >= 0 ? "Overload / Overheat trend" : "Underperformance trend",
            riskScore,
            confidence,
            alertLevel,
            rootCause:
              absDelta >= 18
                ? "Sharp divergence from model baseline"
                : absDelta >= 10
                ? "Sustained drift from expected behavior"
                : "Minor transient deviation",
            aiRecommendation:
              absDelta >= 18
                ? "Run immediate inspection and reduce operational load."
                : "Monitor sensor stream and schedule targeted diagnostics.",
          };

        return {
          ...item,
          delta,
          absDelta,
          level,
          aiResult,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [chartData]);

  const onRangeChange = (next: TimeRange) => {
    setTimeRange(next);
    router.replace(`/anomalies?range=${next}`);
  };

  return (
    <div className="space-y-6 route-accent-maintenance">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="heading-kicker">Detailed monitoring</p>
          <h1 className="heading-display text-2xl font-bold tracking-tight sm:text-3xl">Anomaly Details</h1>
          <p className="text-sm text-muted-foreground">
            Selected range anomalies with complete timeline and event-level details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            Total anomalies: <span className="text-foreground">{anomalies.length}</span>
          </div>
          <Select value={timeRange} onValueChange={(value) => onRangeChange(value as TimeRange)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="3d">3 Days</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">Quarter</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild variant="outline" className="gap-2 ml-auto">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Anomaly Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="detailsValueGradient" x1="0" y1="0" x2="0" y2="1">
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
                          {point.isAnomaly && <p className="font-medium text-critical">Anomaly</p>}
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
                  fill="url(#detailsValueGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--chart-secondary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                {chartData.filter((point) => point.isAnomaly).map((point, index) => (
                  <ReferenceDot
                    key={`${point.timestamp}-${index}`}
                    x={point.timestamp}
                    y={point.value}
                    r={5}
                    fill="var(--chart-critical)"
                    stroke="var(--chart-critical)"
                    strokeWidth={2}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">All Anomalies In Selected Range</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] pr-2 sm:pr-3">
            <div className="space-y-2">
              {anomalies.map((item, index) => (
                <button
                  key={`${item.timestamp}-${index}`}
                  onClick={() => router.push(`/anomalies/${encodeURIComponent(item.timestamp)}`)}
                  className="w-full cursor-pointer rounded-xl border border-border/70 bg-background/55 p-3 text-left transition-all hover:border-primary/50 hover:bg-background/75 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{item.fullLabel}</p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-2 py-0.5 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                      <span className={item.level === "Critical" ? "text-critical" : item.level === "Warning" ? "text-warning" : "text-info"}>
                        {item.level}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <p>Actual: <span className="font-semibold">{item.value.toFixed(1)}</span></p>
                    <p>Predicted: <span className="font-semibold">{item.predicted.toFixed(1)}</span></p>
                    <p>
                      Delta: <span className={item.delta >= 0 ? "font-semibold text-critical" : "font-semibold text-warning"}>{item.delta >= 0 ? "+" : ""}{item.delta.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>
                      Prediction: <span className="font-medium text-foreground">{item.aiResult.predictionType}</span>
                    </p>
                    <p>
                      Risk / Confidence: <span className="font-medium text-foreground">{item.aiResult.riskScore}% / {item.aiResult.confidence}%</span>
                    </p>
                    <p className="sm:col-span-2">
                      Root cause: <span className="font-medium text-foreground">{item.aiResult.rootCause}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

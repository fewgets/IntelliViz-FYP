"use client";

import {
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceDot,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alerts, generateEnergyData } from "@/lib/mock-data";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ExternalLink } from "lucide-react";

type TimeRange = "6h" | "12h" | "24h";

const RANGE_HOURS: Record<TimeRange, number> = {
  "6h": 6,
  "12h": 12,
  "24h": 24,
};

const POWER_ALERT_KEYWORDS = [
  "power",
  "energy",
  "consumption",
  "voltage",
  "current",
  "load",
];

export function AnomalyChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [compact, setCompact] = useState(false);
  const data = useMemo(() => generateEnergyData(), []);
  const router = useRouter();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateCompact = () => setCompact(mediaQuery.matches);
    updateCompact();

    mediaQuery.addEventListener("change", updateCompact);
    return () => mediaQuery.removeEventListener("change", updateCompact);
  }, []);

  const filteredData = useMemo(() => {
    const selectedHours = RANGE_HOURS[timeRange] ?? 24;
    const latestTimestamp = data.length
      ? new Date(data[data.length - 1].timestamp).getTime()
      : Date.now();
    const cutoff = latestTimestamp - selectedHours * 60 * 60 * 1000;
    return data.filter((item) => new Date(item.timestamp).getTime() >= cutoff);
  }, [data, timeRange]);

  const toChartPoint = (item: (typeof filteredData)[number]) => {
    const date = new Date(item.timestamp);
    const deviation =
      item.average > 0 ? Math.abs(item.consumption - item.average) / item.average : 0;

    return {
      ...item,
      axisLabel: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fullLabel: date.toLocaleString(),
      isPowerAnomaly: deviation >= 0.22,
      deviation,
    };
  };

  const chartData = useMemo(() => {
    const step = compact ? 2 : 1;
    return filteredData.filter((_, index) => index % step === 0).map(toChartPoint);
  }, [compact, filteredData, timeRange]);

  const powerAnomalyCount = useMemo(
    () => chartData.filter((item) => item.isPowerAnomaly).length,
    [chartData]
  );

  const unresolvedAlerts = useMemo(() => alerts.filter((alert) => !alert.acknowledged), []);

  const anomalyPoints = chartData.filter((d) => d.isPowerAnomaly);
  const hasData = chartData.length > 0;

  const axisLabelByTimestamp = useMemo(
    () => new Map(chartData.map((item) => [item.timestamp, item.axisLabel])),
    [chartData]
  );

  const fullLabelByTimestamp = useMemo(
    () => new Map(chartData.map((item) => [item.timestamp, item.fullLabel])),
    [chartData]
  );

  const maxConsumption = useMemo(() => {
    if (chartData.length === 0) return 1000;
    return Math.max(...chartData.map((d) => d.consumption));
  }, [chartData]);

  const peakLimit = maxConsumption * 1.05;
  const warningLimit = maxConsumption * 0.85;

  const openDetails = () => {
    router.push(`/anomalies?range=${timeRange}&focus=power`);
  };

  return (
    <Card className="h-full min-h-[250px] relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md shadow-2xl flex flex-col">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warning/50 to-transparent" />
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-foreground/90">
            Power Consumption Anomaly
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overall plant power consumption vs baseline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
            Anomalies: <span className="text-foreground">{powerAnomalyCount}</span>
          </div>
          <button
            type="button"
            onClick={openDetails}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border/70 bg-background px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Details
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="12h">12 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pb-2 px-3 sm:px-4">
        {!hasData ? (
          <div className="empty-state flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">No power telemetry available</p>
            <p className="text-xs text-muted-foreground">Try a different range after telemetry sync.</p>
          </div>
        ) : (
          <>
        <div className="flex-1 min-h-[150px] w-full cursor-pointer" onClick={openDetails}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} onClick={openDetails} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-white/5"
                vertical={false}
              />
              <ReferenceArea y1={warningLimit} y2={peakLimit} fill="var(--warning)" fillOpacity={0.05} />
              <ReferenceArea y1={peakLimit} fill="var(--critical)" fillOpacity={0.05} />
              <ReferenceLine 
                y={peakLimit} 
                stroke="var(--critical)" 
                strokeDasharray="3 3" 
                label={{ position: 'insideTopLeft', value: 'PEAK DEMAND LIMIT', fill: 'var(--critical)', fontSize: 10, fontWeight: 'bold' }} 
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => axisLabelByTimestamp.get(timestamp) ?? ""}
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
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg min-w-[150px]">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <p className="text-xs text-muted-foreground font-medium">
                          {fullLabelByTimestamp.get(data.timestamp) ?? "--"}
                        </p>
                        {data.consumption > peakLimit && (
                          <div className="animate-pulse bg-critical/20 text-critical text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-critical/30">
                            Spike
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm flex justify-between">
                          <span className="text-warning font-medium">Consumption:</span>
                          <span className="font-bold">{data.consumption} kW</span>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span className="text-primary font-medium">Baseline:</span>
                          <span className="font-bold">{data.average} kW</span>
                        </p>
                        {data.isPowerAnomaly && (
                          <p className="text-sm flex justify-between font-medium text-critical pt-1 border-t border-border mt-1">
                            <span>Deviation:</span>
                            <span>{(data.deviation * 100).toFixed(1)}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="var(--chart-warning)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--chart-primary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              {anomalyPoints.map((point, i) => (
                <ReferenceDot
                  key={i}
                  x={point.timestamp}
                  y={point.consumption}
                  r={6}
                  fill="var(--chart-critical)"
                  stroke="var(--chart-critical)"
                  strokeWidth={2}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Consumption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-critical" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Power anomaly</span>
          </div>
        </div>

          </>
        )}
      </CardContent>
    </Card>
  );
}

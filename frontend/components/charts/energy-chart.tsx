"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateEnergyData } from "@/lib/mock-data";
import { useEffect, useMemo, useState } from "react";
import { DatabaseZap, Zap } from "lucide-react";

export function EnergyChart() {
  const data = useMemo(() => generateEnergyData(), []);
  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setMounted(true);

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateCompact = () => setCompact(mediaQuery.matches);
    updateCompact();

    mediaQuery.addEventListener("change", updateCompact);
    return () => mediaQuery.removeEventListener("change", updateCompact);
  }, []);

  const chartData = useMemo(() => {
    const step = compact ? 2 : 1;
    return data
      .filter((_, index) => index % step === 0)
      .map((item) => {
        return {
          ...item,
        };
      });
  }, [data, compact]);

  const totalConsumption = data.reduce((acc, d) => acc + d.consumption, 0);
  const peakConsumption = Math.max(...data.map((d) => d.consumption));
  const hasData = data.length > 0;

  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-warning/0 via-warning/50 to-primary/0" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            Energy Consumption
          </CardTitle>
          <p className="text-sm text-muted-foreground">Last 24 hours</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
          <Zap className="h-5 w-5 text-warning" />
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="empty-state flex h-[244px] flex-col items-center justify-center gap-2 text-center">
            <DatabaseZap className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">No energy data yet</p>
            <p className="text-xs text-muted-foreground">Incoming telemetry will appear automatically.</p>
          </div>
        ) : (
          <>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/60 bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{mounted ? `${(totalConsumption / 1000).toFixed(1)} MWh` : "--"}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="text-xl font-bold text-warning">{mounted ? `${peakConsumption.toFixed(0)} kW` : "--"}</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
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
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <div className="mt-1 space-y-1">
                        <p className="text-sm">
                          <span className="text-warning">Consumption:</span>{" "}
                          <span className="font-medium">{data.consumption} kW</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Average:</span>{" "}
                          <span className="font-medium">{data.average} kW</span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="consumption"
                fill="var(--chart-warning)"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--chart-primary)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

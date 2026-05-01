"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPITrendProps {
  label: string;
  value: string | number;
  trend: number;
  isPositive: boolean;
  color: string;
}

export function KPITrends() {
  const kpis: KPITrendProps[] = [
    {
      label: "Active Machines",
      value: "21/24",
      trend: 2.5,
      isPositive: true,
      color: "success",
    },
    {
      label: "Production Efficiency",
      value: "87.5%",
      trend: 1.8,
      isPositive: true,
      color: "success",
    },
    {
      label: "System Health",
      value: "92%",
      trend: 0.5,
      isPositive: true,
      color: "success",
    },
    {
      label: "Energy Cost Trend",
      value: "+3.1%",
      trend: 3.1,
      isPositive: false,
      color: "warning",
    },
  ];

  return (
    <Card className="rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">KPI Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">vs. yesterday</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
            >
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 text-lg font-semibold">{kpi.value}</p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1",
                  kpi.isPositive ? "bg-success/10" : "bg-warning/10"
                )}
              >
                {kpi.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-warning" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold",
                    kpi.isPositive ? "text-success" : "text-warning"
                  )}
                >
                  {kpi.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

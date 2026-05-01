"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { machines, generateEnergyData } from "@/lib/mock-data";
import { useMemo } from "react";
import { TrendingUp, Zap, Clock } from "lucide-react";

export function PerformanceMetrics() {
  const metrics = useMemo(() => {
    const energyData = generateEnergyData();
    const totalEnergy = energyData.reduce((sum, item) => sum + item.consumption, 0);
    const avgUptime = machines.reduce((sum, m) => sum + m.uptime, 0) / machines.length;
    const avgPowerDraw = machines.reduce((sum, m) => {
      const powerSensor = m.sensors.find((s) => s.type === "power");
      return sum + (powerSensor?.value || 0);
    }, 0) / machines.length;

    return [
      {
        label: "Avg Uptime",
        value: `${avgUptime.toFixed(1)}%`,
        icon: TrendingUp,
        color: "text-success",
        bg: "bg-success/10",
      },
      {
        label: "Total Energy (24h)",
        value: `${(totalEnergy / 1000).toFixed(1)} MWh`,
        icon: Zap,
        color: "text-warning",
        bg: "bg-warning/10",
      },
      {
        label: "Avg Power Draw",
        value: `${avgPowerDraw.toFixed(1)} kW`,
        icon: Clock,
        color: "text-info",
        bg: "bg-info/10",
      },
    ];
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className="rounded-xl border-border/70 bg-card/60 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`rounded-lg p-2 ${metric.bg}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

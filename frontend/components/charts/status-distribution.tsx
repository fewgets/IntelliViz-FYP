"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { machines } from "@/lib/mock-data";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function StatusDistribution({ 
  onSliceClick, 
  activeFilter = "all" 
}: { 
  onSliceClick?: (status: string) => void;
  activeFilter?: string;
}) {
  const data = useMemo(() => {
    const statusCounts = {
      operational: 0,
      warning: 0,
      critical: 0,
      offline: 0,
    };

    machines.forEach((machine) => {
      statusCounts[machine.status]++;
    });

    return [
      { name: "Operational", value: statusCounts.operational, color: "#5b11d2", status: "operational" },
      { name: "Warning", value: statusCounts.warning, color: "#F59E0B", status: "warning" },
      { name: "Critical", value: statusCounts.critical, color: "#f42121", status: "critical" },
      { name: "Offline", value: statusCounts.offline, color: "#0b0b0c", status: "offline" },
    ];
  }, []);

  const totalMachines = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [data]
  );

  return (
      <Card className="relative h-fit overflow-visible rounded-2xl border border-white/10 bg-card/40 pt-2 pb-2 shadow-2xl backdrop-blur-md sm:pt-3 sm:pb-2">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
        <CardHeader className="pb-2.5 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold tracking-tight text-foreground/90">Fleet Status</CardTitle>
            <div className="flex items-center gap-1 rounded-full bg-rose-500/10 px-1.5 py-0.5 border border-rose-500/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500"></span>
              <span className="text-[9px] font-medium uppercase tracking-tighter text-rose-500">Real-time</span>
            </div>
          </div>
        </CardHeader>
      <CardContent className="pt-1 pb-1">
        <div className="h-[200px] sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="42%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                cornerRadius={6}
                dataKey="value"
                stroke="none"
                className="cursor-pointer outline-none"
                onClick={(entry) => onSliceClick?.(entry.status)}
              >
                <Label
                  value={`Total\n${totalMachines}`}
                  position="center"
                  className="fill-foreground text-sm font-semibold whitespace-pre"
                />
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className={cn(
                      "transition-all duration-300",
                      activeFilter !== "all" && activeFilter !== entry.status ? "opacity-30 scale-95" : "opacity-100 scale-100",
                      "hover:opacity-100 hover:scale-105"
                    )}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} machines`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 justify-center text-xs sm:text-sm" suppressHydrationWarning>
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-semibold text-foreground ml-1">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

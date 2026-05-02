"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeeklyOverview() {
  const [expanded, setExpanded] = useState(true);

  const weekData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();

    return days.map((day, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (6 - index));

      const avgRuntime = 16 + Math.random() * 8;
      const energyUsed = 1200 + Math.random() * 300;
      const efficiency = 85 + Math.random() * 10;

      return {
        day,
        date: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        runtime: avgRuntime.toFixed(1),
        energy: energyUsed.toFixed(0),
        efficiency: efficiency.toFixed(1),
      };
    });
  }, []);

  return (
    <Card className="rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <CardTitle className="text-base font-medium">7-Day Performance</CardTitle>
          <p className="text-sm text-muted-foreground">Week-over-week comparison</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
              <div>Day</div>
              <div>Date</div>
              <div>Runtime</div>
              <div>Energy</div>
              <div>Efficiency</div>
            </div>
            {weekData.map((day, index) => (
              <div
                key={index}
                className="grid grid-cols-7 gap-1.5 rounded-lg border border-border/30 bg-muted/20 p-2 text-center text-xs"
              >
                <div className="font-semibold">{day.day}</div>
                <div className="text-muted-foreground">{day.date}</div>
                <div className="font-medium text-info">{day.runtime}h</div>
                <div className="font-medium text-warning">{day.energy} kWh</div>
                <div className={cn("font-medium", day.efficiency > 88 ? "text-success" : "text-warning")}>
                  {day.efficiency}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

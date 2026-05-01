"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { machines } from "@/lib/mock-data";
import { useMemo } from "react";
import { AlertTriangle, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function MaintenanceWarning() {
  const machinesNeedingMaintenance = useMemo(() => {
    return machines
      .filter((machine) => {
        const runningHours = (machine.uptime / 100) * 24;
        const daysSinceLastMaintenance = Math.floor(
          (Date.now() - new Date(machine.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24)
        );
        return runningHours > 20 || daysSinceLastMaintenance > 20;
      })
      .slice(0, 5);
  }, []);

  if (machinesNeedingMaintenance.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border-warning/30 bg-warning/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-base font-medium">Predictive Maintenance</CardTitle>
          </div>
          <Badge variant="outline" className="border-warning/30">
            {machinesNeedingMaintenance.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Machines needing attention soon</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {machinesNeedingMaintenance.map((machine) => (
            <Link
              key={machine.id}
              href={`/machines/${machine.id}`}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:bg-card/60"
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium">{machine.name}</p>
                  <p className="text-xs text-muted-foreground">{machine.id}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-warning">
                {((machine.uptime / 100) * 24).toFixed(0)}h runtime
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

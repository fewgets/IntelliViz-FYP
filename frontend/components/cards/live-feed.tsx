"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alerts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { AlertSeverity } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertTriangle; className: string; bg: string }
> = {
  critical: {
    icon: AlertTriangle,
    className: "text-critical",
    bg: "bg-critical/10",
  },
  warning: {
    icon: AlertCircle,
    className: "text-warning",
    bg: "bg-warning/10",
  },
  info: {
    icon: Info,
    className: "text-info",
    bg: "bg-info/10",
  },
};

export function LiveFeed() {
  const router = useRouter();
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="relative col-span-full flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:h-[420px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-critical/0 via-critical/45 to-warning/0" />
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 sm:p-6 sm:pb-2">
        <div>
          <CardTitle className="text-sm font-medium sm:text-base">Live Anomaly Feed</CardTitle>
          <p className="text-xs text-muted-foreground sm:text-sm">Real-time system alerts</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-full w-full rounded-full bg-success" />
          </span>
          <span className="text-[10px] text-success sm:text-xs">Live</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-2 sm:p-6 sm:pt-2">
        <ScrollArea className="h-[248px] pr-2 sm:h-[268px] sm:pr-4">
          <div className="space-y-2 sm:space-y-3">
            {alerts.map((alert, index) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <motion.button
                  key={alert.id}
                  onClick={() => router.push(`/operations/alerts/${alert.id}`)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative w-full cursor-pointer rounded-lg border border-border p-2 text-left transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-md sm:p-3",
                    !alert.acknowledged && "border-l-2",
                    !alert.acknowledged &&
                      alert.severity === "critical" &&
                      "border-l-critical",
                    !alert.acknowledged &&
                      alert.severity === "warning" &&
                      "border-l-warning",
                    !alert.acknowledged &&
                      alert.severity === "info" &&
                      "border-l-info"
                  )}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4", config.className)} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-medium leading-tight sm:text-sm">
                          {alert.title}
                        </p>
                        <span className="flex-shrink-0 text-[9px] text-muted-foreground sm:text-[10px]">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                        {alert.machineName}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

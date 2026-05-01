"use client";

import { X, AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { alerts } from "@/lib/mock-data";
import type { AlertSeverity } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

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

export function AlertsPanel({ open, onClose }: AlertsPanelProps) {
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-96 border-l border-border/70 bg-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                  <h2 className="text-lg font-semibold">Alerts</h2>
                  <p className="text-sm text-muted-foreground">
                    {alerts.filter((a) => !a.acknowledged).length} unread alerts
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-2 border-b border-border px-4 py-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-critical/10 text-critical hover:bg-critical/20"
                >
                  Critical ({alerts.filter((a) => a.severity === "critical").length})
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-warning/10 text-warning hover:bg-warning/20"
                >
                  Warning ({alerts.filter((a) => a.severity === "warning").length})
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-info/10 text-info hover:bg-info/20"
                >
                  Info ({alerts.filter((a) => a.severity === "info").length})
                </Button>
              </div>

              {/* Alerts List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                  {alerts.map((alert, index) => {
                    const config = severityConfig[alert.severity];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "relative rounded-lg border border-border p-4 transition-colors hover:bg-muted/30",
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
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              config.bg
                            )}
                          >
                            <Icon className={cn("h-4 w-4", config.className)} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">
                                {alert.title}
                              </p>
                              {alert.acknowledged && (
                                <Check className="h-4 w-4 shrink-0 text-success" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {alert.machineName}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {formatTime(alert.timestamp)}
                              </span>
                              {!alert.acknowledged && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                >
                                  Acknowledge
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-border p-4">
                <Button variant="outline" className="w-full">
                  View All Alerts
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

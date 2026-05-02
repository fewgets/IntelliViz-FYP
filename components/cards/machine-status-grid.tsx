"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MachineStatus } from "@/types";
import { useRef } from "react";

const statusConfig: Record<
  MachineStatus,
  { label: string; className: string; dotClass: string }
> = {
  operational: {
    label: "Operational",
    className: "border-success/30 bg-success/5",
    dotClass: "bg-success",
  },
  warning: {
    label: "Warning",
    className: "border-warning/30 bg-warning/5",
    dotClass: "bg-warning",
  },
  critical: {
    label: "Critical",
    className: "border-critical/30 bg-critical/5",
    dotClass: "bg-critical animate-pulse",
  },
  offline: {
    label: "Offline",
    className: "border-muted/30 bg-muted/5",
    dotClass: "bg-muted-foreground",
  },
};

export function MachineStatusGrid() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollCards = (direction: "up" | "down") => {
    if (!scrollRef.current) return;
    const offset = direction === "up" ? -180 : 180;
    scrollRef.current.scrollBy({ top: offset, behavior: "smooth" });
  };

  return (
    <Card className="relative col-span-full flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:h-[420px]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-info/0" />
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 sm:p-6 sm:pb-2">
        <div>
          <CardTitle className="text-sm font-medium sm:text-base">Machine Status</CardTitle>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Quick overview of all machines
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollCards("up")}
            className="h-8 w-8"
          >
            <ChevronUp className="h-4 w-4" />
            <span className="sr-only">Scroll up machines</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollCards("down")}
            className="h-8 w-8"
          >
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Scroll down machines</span>
          </Button>
          <Link
            href="/machines"
            className="text-xs text-primary hover:underline sm:text-sm"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 p-4 pt-2 sm:p-6 sm:pt-2">
        <div
          ref={scrollRef}
          className="h-[600px] w-full overflow-y-auto pr-1 sm:h-[600px] sm:pr-2"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {machines.map((machine, index) => {
            const config = statusConfig[machine.status];

            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index, 8) * 0.03 }}
              >
                <Link href={`/machines/${machine.id}`}>
                  <div
                    className={cn(
                      "group h-24 cursor-pointer rounded-xl border p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3",
                      config.className
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                        {machine.id}
                      </span>
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2", config.dotClass)}
                      />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium sm:text-sm">
                      {machine.name}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] sm:mt-2 sm:text-xs">
                      <span className="text-muted-foreground">Efficiency</span>
                      <span
                        className={cn(
                          "font-medium",
                          machine.efficiency >= 90
                            ? "text-success"
                            : machine.efficiency >= 70
                            ? "text-warning"
                            : "text-critical"
                        )}
                      >
                        {machine.efficiency}%
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

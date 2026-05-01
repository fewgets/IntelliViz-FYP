"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface SystemHealthGaugeProps {
  value: number;
  className?: string;
}

export function SystemHealthGauge({ value, className }: SystemHealthGaugeProps) {
  const router = useRouter();

  const getHealthColor = (val: number) => {
    if (val >= 90) return { color: "text-success", stroke: "stroke-success" };
    if (val >= 70) return { color: "text-warning", stroke: "stroke-warning" };
    return { color: "text-critical", stroke: "stroke-critical" };
  };

  const getHealthStatus = (val: number) => {
    if (val >= 90) return "Excellent";
    if (val >= 70) return "Good";
    if (val >= 50) return "Fair";
    return "Critical";
  };

  const health = getHealthColor(value);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <button
      onClick={() => router.push("/system-health")}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)] cursor-pointer text-left",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.10),transparent_55%)]" />
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            System Health Score
          </h3>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>

        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={health.stroke}
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Glow effect */}
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={cn(health.stroke, "opacity-30 blur-md")}
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-4xl font-bold", health.color)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {value}%
            </motion.span>
            <span className="text-sm text-muted-foreground">
              {getHealthStatus(value)}
            </span>
          </div>
        </div>

        {/* Health indicators */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-full rounded-xl border border-border/60 bg-success/10 p-2">
              <span className="text-lg font-semibold leading-none text-success">21</span>
            </div>
            <p className="text-muted-foreground">Active</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full rounded-xl border border-border/60 bg-warning/10 p-2">
              <span className="text-lg font-semibold leading-none text-warning">1</span>
            </div>
            <p className="text-muted-foreground">Warning</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full rounded-xl border border-border/60 bg-critical/10 p-2">
              <span className="text-lg font-semibold leading-none text-critical">2</span>
            </div>
            <p className="text-muted-foreground">Critical</p>
          </div>
        </div>
      </div>
    </button>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "critical";
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    glow: "",
    line: "from-primary/0 via-primary/45 to-primary/0",
  },
  success: {
    icon: "bg-success/10 text-success",
    glow: "hover:glow-success",
    line: "from-sky-500/0 via-sky-500/55 to-sky-500/0",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    glow: "hover:glow-warning",
    line: "from-rose-500/0 via-rose-500/55 to-rose-500/0",
  },
  critical: {
    icon: "bg-critical/10 text-critical",
    glow: "hover:glow-critical",
    line: "from-red-500/0 via-red-500/55 to-red-500/0",
  },
};

const variantGlowColors = {
  default: "color-mix(in oklch, var(--primary), transparent 82%)",
  success: "color-mix(in oklch, var(--success), transparent 82%)",
  warning: "color-mix(in oklch, var(--warning), transparent 82%)",
  critical: "color-mix(in oklch, var(--critical), transparent 82%)",
} as const;

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointerPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={() => setPointerPosition({ x: 0, y: 0 })}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 sm:p-3 lg:p-4 lg:min-h-[118px]",
        styles.glow,
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] grid-pattern" />
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage: `radial-gradient(circle at ${pointerPosition.x}px ${pointerPosition.y}px, ${variantGlowColors[variant]}, transparent 70%)`,
        }}
      />
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", styles.line)} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
          <p className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{title}</p>
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 sm:gap-2">
            <p className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-[10px] font-medium sm:text-xs",
                  trend.isPositive ? "text-success" : "text-critical"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] leading-snug text-muted-foreground sm:text-xs">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9 lg:h-10 lg:w-10",
            styles.icon
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

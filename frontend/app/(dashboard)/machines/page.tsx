"use client";

import { machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { MachineStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Activity,
  Thermometer,
  Gauge,
  Clock,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  MachineStatus,
  { label: string; className: string; dotClass: string; badge: string }
> = {
  operational: {
    label: "Operational",
    className: "border-success/30 bg-success/5 hover:border-success/50",
    dotClass: "bg-success",
    badge: "bg-success/10 text-success",
  },
  warning: {
    label: "Warning",
    className: "border-warning/30 bg-warning/5 hover:border-warning/50",
    dotClass: "bg-warning animate-pulse",
    badge: "bg-warning/10 text-warning",
  },
  critical: {
    label: "Critical",
    className: "border-critical/30 bg-critical/5 hover:border-critical/50",
    dotClass: "bg-critical animate-pulse",
    badge: "bg-critical/10 text-critical",
  },
  offline: {
    label: "Offline",
    className: "border-muted/30 bg-muted/5 hover:border-muted/50",
    dotClass: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

export default function MachinesPage() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("q")?.trim() ?? "";
  const statusFromQuery = searchParams.get("status");
  const initialStatusFilter =
    statusFromQuery === "all" ||
      statusFromQuery === "operational" ||
      statusFromQuery === "warning" ||
      statusFromQuery === "critical" ||
      statusFromQuery === "offline"
      ? statusFromQuery
      : "all";

  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch =
        machine.name.toLowerCase().includes(search.toLowerCase()) ||
        machine.id.toLowerCase().includes(search.toLowerCase()) ||
        machine.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: machines.length,
      operational: machines.filter((m) => m.status === "operational").length,
      warning: machines.filter((m) => m.status === "warning").length,
      critical: machines.filter((m) => m.status === "critical").length,
      offline: machines.filter((m) => m.status === "offline").length,
    };
  }, []);

  return (
    <div className="space-y-6 route-accent-machines">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Machine Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all industrial equipment
          </p>
        </div>
        <Button asChild>
          <Link href="/machines/add">Add New Machine</Link>
        </Button>
      </motion.div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {(
          [
            { key: "all", label: "All Machines" },
            { key: "operational", label: "Operational" },
            { key: "warning", label: "Warning" },
            { key: "critical", label: "Critical" },
            { key: "offline", label: "Offline" },
          ] as const
        ).map((status) => (
          <button
            key={status.key}
            onClick={() => setStatusFilter(status.key)}
            className={cn(
              "min-h-24 rounded-lg border p-3 text-left transition-all sm:p-4",
              statusFilter === status.key
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <p className="text-sm text-muted-foreground">{status.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {statusCounts[status.key]}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search machines by name, ID, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-border self-end sm:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-10 w-10"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-10 w-10"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Machine Grid */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMachines.map((machine, index) => {
            const config = statusConfig[machine.status];

            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/machines/${machine.id}`}>
                  <div
                    className={cn(
                      "group cursor-pointer rounded-xl border p-5 transition-all hover:shadow-lg",
                      config.className
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {machine.id}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          {machine.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {machine.type}
                        </p>
                      </div>
                      <Badge className={config.badge}>
                        <span
                          className={cn(
                            "mr-1.5 h-1.5 w-1.5 rounded-full",
                            config.dotClass
                          )}
                        />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Efficiency
                          </p>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              machine.efficiency >= 90
                                ? "text-success"
                                : machine.efficiency >= 70
                                  ? "text-warning"
                                  : "text-critical"
                            )}
                          >
                            {machine.efficiency}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                        <Gauge className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Uptime
                          </p>
                          <p className="text-sm font-medium">
                            {machine.uptime}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sensor Preview */}
                    {machine.sensors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {machine.sensors.slice(0, 2).map((sensor) => (
                          <div
                            key={sensor.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {sensor.name}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                sensor.value >= sensor.threshold.critical
                                  ? "text-critical"
                                  : sensor.value >= sensor.threshold.warning
                                    ? "text-warning"
                                    : "text-foreground"
                              )}
                            >
                              {sensor.value} {sensor.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-2 flex items-center gap-1 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {machine.location}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Machine
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Efficiency
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Uptime
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => {
                const config = statusConfig[machine.status];
                return (
                  <tr
                    key={machine.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-2 py-2">
                      <Link
                        href={`/machines/${machine.id}`}
                        className="hover:text-primary"
                      >
                        <p className="font-medium">{machine.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {machine.id} - {machine.type}
                        </p>
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <Badge className={config.badge}>
                        <span
                          className={cn(
                            "mr-1.5 h-1.5 w-1.5 rounded-full",
                            config.dotClass
                          )}
                        />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-2 py-2">
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
                    </td>
                    <td className="px-2 py-2 font-medium">{machine.uptime}%</td>
                    <td className="px-2 py-2 text-sm text-muted-foreground">
                      {machine.location}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

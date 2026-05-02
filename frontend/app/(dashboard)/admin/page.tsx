"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { machines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Palette,
  Factory,
  Shield,
  Database,
  Key,
  Save,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  applyThemePreferences,
  getPresetsByMode,
  resolveInitialThemePreferences,
  type ThemeMode,
  type ThemePresetId,
} from "@/lib/theme";

export default function AdminPage() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "machines" ||
    searchParams.get("tab") === "alerts" ||
    searchParams.get("tab") === "notifications" ||
    searchParams.get("tab") === "theme" ||
    searchParams.get("tab") === "api"
      ? searchParams.get("tab")
      : "alerts";
  const [activeTab, setActiveTab] = useState<string>(initialTab || "alerts");
  const [selectedMachine, setSelectedMachine] = useState(machines[0].id);
  const [thresholds, setThresholds] = useState({
    temperature: { warning: 75, critical: 90 },
    vibration: { warning: 5, critical: 8 },
    pressure: { warning: 200, critical: 230 },
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    inApp: true,
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [themePreset, setThemePreset] = useState<ThemePresetId>("dark-control");
  const { setTheme } = useTheme();

  useEffect(() => {
    setActiveTab(initialTab || "alerts");
  }, [initialTab]);

  useEffect(() => {
    const resolved = resolveInitialThemePreferences();
    setThemeMode(resolved.mode);
    setThemePreset(resolved.presetId);
  }, []);

  const handleModeChange = (mode: ThemeMode) => {
    const nextPreset = getPresetsByMode(mode).find((preset) => preset.id === themePreset)?.id
      ?? getPresetsByMode(mode)[0]?.id;

    if (!nextPreset) return;

    setThemeMode(mode);
    setThemePreset(nextPreset);
    setTheme(mode);
    applyThemePreferences(mode, nextPreset);
  };

  const handlePresetChange = (presetId: ThemePresetId) => {
    const preset = getPresetsByMode(themeMode).find((item) => item.id === presetId);
    if (!preset) return;

    setThemePreset(presetId);
    setTheme(themeMode);
    applyThemePreferences(themeMode, presetId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings, alerts, and integrations
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Mail className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="machines" className="gap-2">
            <Factory className="h-4 w-4" />
            Machines
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Database className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* Alert Configuration */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Configure warning and critical thresholds per machine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Label>Select Machine:</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.name} ({machine.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6">
                {/* Temperature */}
                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-4 font-medium">Temperature Thresholds (°C)</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-warning">Warning Level</Label>
                        <span className="font-mono text-sm">{thresholds.temperature.warning}°C</span>
                      </div>
                      <Slider
                        value={[thresholds.temperature.warning]}
                        min={50}
                        max={100}
                        step={1}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            temperature: { ...prev.temperature, warning: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-warning"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-critical">Critical Level</Label>
                        <span className="font-mono text-sm">{thresholds.temperature.critical}°C</span>
                      </div>
                      <Slider
                        value={[thresholds.temperature.critical]}
                        min={50}
                        max={100}
                        step={1}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            temperature: { ...prev.temperature, critical: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-critical"
                      />
                    </div>
                  </div>
                </div>

                {/* Vibration */}
                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-4 font-medium">Vibration Thresholds (mm/s)</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-warning">Warning Level</Label>
                        <span className="font-mono text-sm">{thresholds.vibration.warning} mm/s</span>
                      </div>
                      <Slider
                        value={[thresholds.vibration.warning]}
                        min={1}
                        max={10}
                        step={0.5}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            vibration: { ...prev.vibration, warning: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-warning"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-critical">Critical Level</Label>
                        <span className="font-mono text-sm">{thresholds.vibration.critical} mm/s</span>
                      </div>
                      <Slider
                        value={[thresholds.vibration.critical]}
                        min={1}
                        max={10}
                        step={0.5}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            vibration: { ...prev.vibration, critical: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-critical"
                      />
                    </div>
                  </div>
                </div>

                {/* Pressure */}
                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-4 font-medium">Pressure Thresholds (bar)</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-warning">Warning Level</Label>
                        <span className="font-mono text-sm">{thresholds.pressure.warning} bar</span>
                      </div>
                      <Slider
                        value={[thresholds.pressure.warning]}
                        min={100}
                        max={250}
                        step={5}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            pressure: { ...prev.pressure, warning: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-warning"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-critical">Critical Level</Label>
                        <span className="font-mono text-sm">{thresholds.pressure.critical} bar</span>
                      </div>
                      <Slider
                        value={[thresholds.pressure.critical]}
                        min={100}
                        max={250}
                        step={5}
                        onValueChange={([value]) =>
                          setThresholds((prev) => ({
                            ...prev,
                            pressure: { ...prev.pressure, critical: value },
                          }))
                        }
                        className="[&_[role=slider]]:bg-critical"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  {
                    key: "email",
                    icon: Mail,
                    title: "Email Notifications",
                    description: "Receive alerts via email",
                  },
                  {
                    key: "sms",
                    icon: Smartphone,
                    title: "SMS Notifications",
                    description: "Receive alerts via text message",
                  },
                  {
                    key: "whatsapp",
                    icon: MessageSquare,
                    title: "WhatsApp Webhook",
                    description: "Receive alerts via WhatsApp",
                  },
                  {
                    key: "inApp",
                    icon: Bell,
                    title: "In-App Notifications",
                    description: "Receive alerts in the dashboard",
                  },
                ].map((channel) => (
                  <div
                    key={channel.key}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <channel.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{channel.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[channel.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [channel.key]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">Email Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Primary Email</Label>
                    <Input type="email" defaultValue="admin@nexusai.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Email</Label>
                    <Input type="email" placeholder="backup@company.com" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">WhatsApp Webhook</h4>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    type="url"
                    placeholder="https://api.whatsapp.com/webhook/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your WhatsApp Business API webhook URL
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Customization */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Select visual presets for light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">Theme Mode</h4>
                <div className="flex gap-3">
                  <Button
                    variant={themeMode === "light" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleModeChange("light")}
                  >
                    Light
                  </Button>
                  <Button
                    variant={themeMode === "dark" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleModeChange("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">{themeMode === "light" ? "Light" : "Dark"} Presets</h4>
                  <Badge variant="outline">{getPresetsByMode(themeMode).length} options</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {getPresetsByMode(themeMode).map((preset) => {
                    const isSelected = themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold">{preset.name}</p>
                          {isSelected && <Badge>Active</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="h-6 w-6 rounded-full border border-border/60"
                            style={{ backgroundColor: preset.primary }}
                            title="Primary"
                          />
                          <span
                            className="h-6 w-6 rounded-full border border-border/60"
                            style={{ backgroundColor: preset.surface }}
                            title="Surface"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Machine Onboarding */}
        <TabsContent value="machines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Management</CardTitle>
              <CardDescription>
                Add, configure, and manage industrial machines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button asChild>
                <Link href="/machines/add">
                <Factory className="mr-2 h-4 w-4" />
                Add New Machine
                </Link>
              </Button>

              <div className="rounded-lg border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Machine
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((machine) => (
                      <tr key={machine.id} className="border-b border-border/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{machine.name}</p>
                          <p className="text-xs text-muted-foreground">{machine.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{machine.type}</td>
                        <td className="px-4 py-3 text-sm">{machine.location}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              machine.status === "operational"
                                ? "bg-success/10 text-success"
                                : machine.status === "warning"
                                ? "bg-warning/10 text-warning"
                                : "bg-critical/10 text-critical"
                            )}
                          >
                            {machine.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-critical">
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API endpoints and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">API Endpoints</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input defaultValue="https://api.nexusai.industrial.com/v1" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Dashboard Summary</Label>
                      <Input defaultValue="/dashboard/summary" />
                    </div>
                    <div className="space-y-2">
                      <Label>Machines List</Label>
                      <Input defaultValue="/machines" />
                    </div>
                    <div className="space-y-2">
                      <Label>Live Alerts</Label>
                      <Input defaultValue="/alerts/live" />
                    </div>
                    <div className="space-y-2">
                      <Label>AI Predictions</Label>
                      <Input defaultValue="/anomalies/predictive" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">API Keys</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        nex_prod_••••••••••••••••
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Key className="mr-2 h-4 w-4" />
                        Reveal
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="font-medium">Development API Key</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        nex_dev_••••••••••••••••
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Key className="mr-2 h-4 w-4" />
                        Reveal
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium">Security</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">
                        Limit API requests per minute
                      </p>
                    </div>
                    <Select defaultValue="1000">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100/min</SelectItem>
                        <SelectItem value="500">500/min</SelectItem>
                        <SelectItem value="1000">1000/min</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelisting</p>
                      <p className="text-sm text-muted-foreground">
                        Restrict API access to specific IPs
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { API_ENDPOINTS } from "@/config/endpoints";
import { CHANNEL_OPTIONS, MACHINE_TYPES, SENSOR_OPTIONS } from "@/config/machine.config";
import { ApiError, apiClient } from "@/lib/api-client";
import type {
  AddMachinePayload,
  AvailableMachineId,
  NotificationChannel,
  SensorType,
} from "@/types/machine";

interface FormState {
  name: string;
  machine_id: string;
  type: string;
  location: string;
  sensors: SensorType[];
  config: {
    predictive: boolean;
    energy: boolean;
    vibration: boolean;
  };
  thresholds: {
    temperature: string;
    vibration: string;
    power: string;
  };
  alerts: {
    enabled: boolean;
    severities: {
      warning: boolean;
      critical: boolean;
    };
    channels: NotificationChannel[];
  };
}

const defaultFormState: FormState = {
  name: "",
  machine_id: "",
  type: "",
  location: "",
  sensors: [],
  config: {
    predictive: true,
    energy: true,
    vibration: true,
  },
  thresholds: {
    temperature: "85",
    vibration: "5",
    power: "120",
  },
  alerts: {
    enabled: true,
    severities: {
      warning: true,
      critical: true,
    },
    channels: ["email"],
  },
};

type FieldErrors = Partial<Record<string, string>>;

export function AddMachineForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [availableIds, setAvailableIds] = useState<AvailableMachineId[]>([]);
  const [idsLoading, setIdsLoading] = useState(false);
  const [idsLoaded, setIdsLoaded] = useState(false);

  const idOptions = useMemo(
    () => availableIds.map((item) => ({ value: item.id, label: item.id })),
    [availableIds]
  );

  const setFieldError = (field: string, message = "") => {
    setErrors((prev) => {
      if (!prev[field] && !message) return prev;
      const next = { ...prev };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const fetchAvailableIds = useCallback(async (query = "") => {
    try {
      setIdsLoading(true);
      const endpoint = query
        ? `${API_ENDPOINTS.AVAILABLE_MACHINE_IDS}?q=${encodeURIComponent(query)}`
        : API_ENDPOINTS.AVAILABLE_MACHINE_IDS;
      const response = await apiClient.get<AvailableMachineId[]>(endpoint);
      setAvailableIds(response.filter((item) => item.available));
      setIdsLoaded(true);
    } catch {
      toast.error("Failed to load available machine IDs");
      setAvailableIds([]);
    } finally {
      setIdsLoading(false);
    }
  }, []);

  const handleIdDropdownOpen = async (open: boolean) => {
    if (!open || idsLoaded) return;
    await fetchAvailableIds();
  };

  const toggleSensor = (sensor: SensorType) => {
    setForm((prev) => {
      const exists = prev.sensors.includes(sensor);
      const nextSensors = exists
        ? prev.sensors.filter((item) => item !== sensor)
        : [...prev.sensors, sensor];
      return { ...prev, sensors: nextSensors };
    });
    setFieldError("sensors");
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setForm((prev) => {
      const exists = prev.alerts.channels.includes(channel);
      const nextChannels = exists
        ? prev.alerts.channels.filter((item) => item !== channel)
        : [...prev.alerts.channels, channel];
      return {
        ...prev,
        alerts: {
          ...prev.alerts,
          channels: nextChannels,
        },
      };
    });
    setFieldError("alert_channels");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) nextErrors.name = "Machine name is required.";
    if (!form.machine_id.trim()) nextErrors.machine_id = "Machine ID is required.";
    if (!form.type.trim()) nextErrors.type = "Machine type is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (form.sensors.length === 0) nextErrors.sensors = "Select at least one sensor.";

    const temperature = Number(form.thresholds.temperature);
    const vibration = Number(form.thresholds.vibration);
    const power = Number(form.thresholds.power);

    if (!Number.isFinite(temperature) || temperature <= 0) {
      nextErrors.temperature = "Temperature limit must be a positive number.";
    }
    if (!Number.isFinite(vibration) || vibration <= 0) {
      nextErrors.vibration = "Vibration limit must be a positive number.";
    }
    if (!Number.isFinite(power) || power <= 0) {
      nextErrors.power = "Power limit must be a positive number.";
    }

    if (form.alerts.enabled) {
      if (!form.alerts.severities.warning && !form.alerts.severities.critical) {
        nextErrors.alert_severities = "Enable at least one severity level.";
      }
      if (form.alerts.channels.length === 0) {
        nextErrors.alert_channels = "Select at least one notification channel.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const payload: AddMachinePayload = {
      machine_id: form.machine_id,
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim(),
      sensors: form.sensors,
      config: form.config,
      thresholds: {
        temperature: Number(form.thresholds.temperature),
        vibration: Number(form.thresholds.vibration),
        power: Number(form.thresholds.power),
      },
      alerts: form.alerts,
    };

    try {
      setSubmitting(true);
      await apiClient.post(API_ENDPOINTS.MACHINES, payload);
      toast.success("Machine added successfully");
      setForm(defaultFormState);
      await fetchAvailableIds();
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFieldError("machine_id", "This machine ID is already assigned.");
        toast.error("Duplicate machine ID");
      } else {
        toast.error("Unable to add machine. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl">Add New Machine</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Machine Profile</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Machine Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                    setFieldError("name");
                  }}
                  placeholder="e.g. Assembly Robot Nova"
                />
                {errors.name && <p className="text-xs text-critical">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="machine-id">Machine ID</Label>
                <Combobox
                  value={form.machine_id}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, machine_id: value }));
                    setFieldError("machine_id");
                  }}
                  options={idOptions}
                  loading={idsLoading}
                  onOpenChange={handleIdDropdownOpen}
                  onSearchChange={fetchAvailableIds}
                  placeholder="Select available ID"
                  searchPlaceholder="Search machine IDs..."
                  emptyText={idsLoaded ? "No IDs available" : "Open dropdown to load IDs"}
                  className="h-10"
                />
                {errors.machine_id && <p className="text-xs text-critical">{errors.machine_id}</p>}
              </div>

              <div className="space-y-2">
                <Label>Machine Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, type: value }));
                    setFieldError("type");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MACHINE_TYPES.map((machineType) => (
                      <SelectItem key={machineType} value={machineType}>
                        {machineType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-critical">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, location: e.target.value }));
                    setFieldError("location");
                  }}
                  placeholder="e.g. Building A - Floor 2"
                />
                {errors.location && <p className="text-xs text-critical">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sensors</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SENSOR_OPTIONS.map((sensor) => (
                  <label key={sensor.value} className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-3 text-sm">
                    <Checkbox
                      checked={form.sensors.includes(sensor.value)}
                      onCheckedChange={() => toggleSensor(sensor.value)}
                    />
                    {sensor.label}
                  </label>
                ))}
              </div>
              {errors.sensors && <p className="text-xs text-critical">{errors.sensors}</p>}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Configuration</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <ToggleField
                label="Predictive Maintenance"
                checked={form.config.predictive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, config: { ...prev.config, predictive: checked } }))
                }
              />
              <ToggleField
                label="Vibration Analysis"
                checked={form.config.vibration}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, config: { ...prev.config, vibration: checked } }))
                }
              />
              <ToggleField
                label="Energy Monitoring"
                checked={form.config.energy}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, config: { ...prev.config, energy: checked } }))
                }
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Thresholds</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <NumberField
                label="Temperature Limit"
                value={form.thresholds.temperature}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, thresholds: { ...prev.thresholds, temperature: value } }));
                  setFieldError("temperature");
                }}
                error={errors.temperature}
              />
              <NumberField
                label="Vibration Limit"
                value={form.thresholds.vibration}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, thresholds: { ...prev.thresholds, vibration: value } }));
                  setFieldError("vibration");
                }}
                error={errors.vibration}
              />
              <NumberField
                label="Power Limit"
                value={form.thresholds.power}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, thresholds: { ...prev.thresholds, power: value } }));
                  setFieldError("power");
                }}
                error={errors.power}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Alert Settings</h3>
            <div className="space-y-4 rounded-xl border border-border/70 bg-background/50 p-4">
              <ToggleField
                label="Enable Alerts"
                checked={form.alerts.enabled}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, alerts: { ...prev.alerts, enabled: checked } }))
                }
              />

              {form.alerts.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Severity Levels</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-3 text-sm">
                        <Checkbox
                          checked={form.alerts.severities.warning}
                          onCheckedChange={(checked) => {
                            const nextValue = Boolean(checked);
                            setForm((prev) => ({
                              ...prev,
                              alerts: {
                                ...prev.alerts,
                                severities: { ...prev.alerts.severities, warning: nextValue },
                              },
                            }));
                            setFieldError("alert_severities");
                          }}
                        />
                        Warning
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-3 text-sm">
                        <Checkbox
                          checked={form.alerts.severities.critical}
                          onCheckedChange={(checked) => {
                            const nextValue = Boolean(checked);
                            setForm((prev) => ({
                              ...prev,
                              alerts: {
                                ...prev.alerts,
                                severities: { ...prev.alerts.severities, critical: nextValue },
                              },
                            }));
                            setFieldError("alert_severities");
                          }}
                        />
                        Critical
                      </label>
                    </div>
                    {errors.alert_severities && <p className="text-xs text-critical">{errors.alert_severities}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {CHANNEL_OPTIONS.map((channel) => (
                        <label key={channel.value} className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-3 text-sm">
                          <Checkbox
                            checked={form.alerts.channels.includes(channel.value)}
                            onCheckedChange={() => toggleChannel(channel.value)}
                          />
                          {channel.label}
                        </label>
                      ))}
                    </div>
                    {errors.alert_channels && <p className="text-xs text-critical">{errors.alert_channels}</p>}
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/machines")}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding Machine..." : "Add Machine"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ToggleField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-3 py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  );
}

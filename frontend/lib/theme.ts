export type ThemeMode = "light" | "dark";

export type ThemePresetId =
  | "light-pure-white"
  | "light-industrial"
  | "light-teal-sand"
  | "light-sky"
  | "light-clean-blue"
  | "light-soft-pastel"
  | "light-mint-fresh"
  | "light-warm-beige"
  | "light-gray-gold"
  | "light-lavender"
  | "dark-control"
  | "dark-graphite"
  | "dark-ember"
  | "dark-modern-blue"
  | "dark-purple-neon"
  | "dark-emerald"
  | "dark-midnight-orange"
  | "dark-indigo-tech"
  | "dark-teal-minimal"
  | "dark-pure-black";

export interface ThemePreset {
  id: ThemePresetId;
  mode: ThemeMode;
  name: string;
  primary: string;
  surface: string;
  cssVars: Record<string, string>;
}

export const THEME_STORAGE_KEY = "intelliviz-theme";
export const THEME_PRESET_STORAGE_KEY = "intelliviz-theme-preset";

export const DEFAULT_THEME_PRESET: Record<ThemeMode, ThemePresetId> = {
  light: "light-industrial",
  dark: "dark-control",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "light-pure-white",
    mode: "light",
    name: "Pure White",
    primary: "#111111",
    surface: "#ffffff",
    cssVars: {
      "--background": "#ffffff",
      "--foreground": "#111111",
      "--card": "#ffffff",
      "--primary": "#111111",
      "--accent": "#111111",
      "--ring": "#111111",
      "--sidebar": "#f5f5f5",
      "--sidebar-primary": "#111111",
      "--info": "#111111",
      "--chart-1": "#111111",
    },
  },
  {
    id: "light-industrial",
    mode: "light",
    name: "Industrial Blue",
    primary: "#3a73ff",
    surface: "#f5f7fb",
    cssVars: {
      "--background": "#f5f7fb",
      "--card": "#ffffff",
      "--primary": "#3a73ff",
      "--accent": "#3a73ff",
      "--ring": "#3a73ff",
      "--sidebar": "#eef3fb",
      "--sidebar-primary": "#3a73ff",
      "--info": "#3a73ff",
      "--chart-1": "#3a73ff",
    },
  },
  {
    id: "light-teal-sand",
    mode: "light",
    name: "Teal Sand",
    primary: "#00a19d",
    surface: "#e4ddd3",
    cssVars: {
      "--background": "#e4ddd3",
      "--foreground": "#1f2d2c",
      "--card": "#f2ebe2",
      "--primary": "#00a19d",
      "--accent": "#00a19d",
      "--ring": "#00a19d",
      "--sidebar": "#ded5c8",
      "--sidebar-primary": "#00a19d",
      "--info": "#00a19d",
      "--chart-1": "#00a19d",
    },
  },
  {
    id: "light-sky",
    mode: "light",
    name: "Sky Steel",
    primary: "#2f80ed",
    surface: "#eaf1f7",
    cssVars: {
      "--background": "#eaf1f7",
      "--foreground": "#1f2c3a",
      "--card": "#f7fbff",
      "--primary": "#2f80ed",
      "--accent": "#2f80ed",
      "--ring": "#2f80ed",
      "--sidebar": "#e3ebf3",
      "--sidebar-primary": "#2f80ed",
      "--info": "#2f80ed",
      "--chart-1": "#2f80ed",
    },
  },
  {
    id: "light-clean-blue",
    mode: "light",
    name: "Clean Blue",
    primary: "#2563EB",
    surface: "#F1F5F9",
    cssVars: {
      "--background": "#FFFFFF",
      "--foreground": "#0F172A",
      "--card": "#F8FBFF",
      "--primary": "#2563EB",
      "--accent": "#2563EB",
      "--ring": "#2563EB",
      "--sidebar": "#F1F5F9",
      "--sidebar-primary": "#2563EB",
      "--info": "#38BDF8",
      "--chart-1": "#2563EB",
    },
  },
  {
    id: "light-soft-pastel",
    mode: "light",
    name: "Soft Pastel",
    primary: "#F472B6",
    surface: "#FDF2F8",
    cssVars: {
      "--background": "#FAFAFA",
      "--foreground": "#1F2937",
      "--card": "#FFFFFF",
      "--primary": "#F472B6",
      "--accent": "#A78BFA",
      "--ring": "#F472B6",
      "--sidebar": "#FDF2F8",
      "--sidebar-primary": "#F472B6",
      "--info": "#A78BFA",
      "--chart-1": "#F472B6",
    },
  },
  {
    id: "light-mint-fresh",
    mode: "light",
    name: "Mint Fresh",
    primary: "#22C55E",
    surface: "#DCFCE7",
    cssVars: {
      "--background": "#F0FDF4",
      "--foreground": "#14532D",
      "--card": "#F7FFF9",
      "--primary": "#22C55E",
      "--accent": "#4ADE80",
      "--ring": "#22C55E",
      "--sidebar": "#DCFCE7",
      "--sidebar-primary": "#22C55E",
      "--info": "#4ADE80",
      "--chart-1": "#22C55E",
    },
  },
  {
    id: "light-warm-beige",
    mode: "light",
    name: "Warm Beige",
    primary: "#FB923C",
    surface: "#FFEDD5",
    cssVars: {
      "--background": "#FFF7ED",
      "--foreground": "#7C2D12",
      "--card": "#FFFDF9",
      "--primary": "#FB923C",
      "--accent": "#FDBA74",
      "--ring": "#FB923C",
      "--sidebar": "#FFEDD5",
      "--sidebar-primary": "#FB923C",
      "--info": "#FDBA74",
      "--chart-1": "#FB923C",
    },
  },
  {
    id: "light-gray-gold",
    mode: "light",
    name: "Gray Gold",
    primary: "#D4AF37",
    surface: "#E5E7EB",
    cssVars: {
      "--background": "#F9FAFB",
      "--foreground": "#111827",
      "--card": "#FFFFFF",
      "--primary": "#D4AF37",
      "--accent": "#FACC15",
      "--ring": "#D4AF37",
      "--sidebar": "#ECEEF2",
      "--sidebar-primary": "#D4AF37",
      "--info": "#FACC15",
      "--chart-1": "#D4AF37",
    },
  },
  {
    id: "light-lavender",
    mode: "light",
    name: "Lavender Light",
    primary: "#7C3AED",
    surface: "#EDE9FE",
    cssVars: {
      "--background": "#F5F3FF",
      "--foreground": "#2E1065",
      "--card": "#FBFAFF",
      "--primary": "#7C3AED",
      "--accent": "#C4B5FD",
      "--ring": "#7C3AED",
      "--sidebar": "#EDE9FE",
      "--sidebar-primary": "#7C3AED",
      "--info": "#C4B5FD",
      "--chart-1": "#7C3AED",
    },
  },
  {
    id: "dark-control",
    mode: "dark",
    name: "Control Center",
    primary: "#6aa2ff",
    surface: "#1a2130",
    cssVars: {
      "--background": "#161d2a",
      "--card": "#1a2130",
      "--primary": "#6aa2ff",
      "--accent": "#6aa2ff",
      "--ring": "#6aa2ff",
      "--sidebar": "#121925",
      "--sidebar-primary": "#6aa2ff",
      "--info": "#6aa2ff",
      "--chart-1": "#6aa2ff",
    },
  },
  {
    id: "dark-graphite",
    mode: "dark",
    name: "Graphite Cyan",
    primary: "#00b8d4",
    surface: "#171c22",
    cssVars: {
      "--background": "#13181f",
      "--card": "#171c22",
      "--primary": "#00b8d4",
      "--accent": "#00b8d4",
      "--ring": "#00b8d4",
      "--sidebar": "#10161d",
      "--sidebar-primary": "#00b8d4",
      "--info": "#00b8d4",
      "--chart-1": "#00b8d4",
    },
  },
  {
    id: "dark-ember",
    mode: "dark",
    name: "Ember Forge",
    primary: "#ff8a3d",
    surface: "#201a16",
    cssVars: {
      "--background": "#181310",
      "--card": "#201a16",
      "--primary": "#ff8a3d",
      "--accent": "#ff8a3d",
      "--ring": "#ff8a3d",
      "--sidebar": "#15110e",
      "--sidebar-primary": "#ff8a3d",
      "--info": "#ff8a3d",
      "--chart-1": "#ff8a3d",
    },
  },
  {
    id: "dark-modern-blue",
    mode: "dark",
    name: "Modern Blue",
    primary: "#3B82F6",
    surface: "#1E293B",
    cssVars: {
      "--background": "#0F172A",
      "--foreground": "#E2E8F0",
      "--card": "#1E293B",
      "--primary": "#3B82F6",
      "--accent": "#22D3EE",
      "--ring": "#3B82F6",
      "--sidebar": "#0C1424",
      "--sidebar-primary": "#3B82F6",
      "--info": "#22D3EE",
      "--chart-1": "#3B82F6",
    },
  },
  {
    id: "dark-purple-neon",
    mode: "dark",
    name: "Purple Neon",
    primary: "#7C3AED",
    surface: "#1A1A2E",
    cssVars: {
      "--background": "#0D0D0D",
      "--foreground": "#F5F5F5",
      "--card": "#1A1A2E",
      "--primary": "#7C3AED",
      "--accent": "#F472B6",
      "--ring": "#7C3AED",
      "--sidebar": "#12121f",
      "--sidebar-primary": "#7C3AED",
      "--info": "#F472B6",
      "--chart-1": "#7C3AED",
    },
  },
  {
    id: "dark-emerald",
    mode: "dark",
    name: "Dark Emerald",
    primary: "#10B981",
    surface: "#064E3B",
    cssVars: {
      "--background": "#022C22",
      "--foreground": "#D1FAE5",
      "--card": "#064E3B",
      "--primary": "#10B981",
      "--accent": "#34D399",
      "--ring": "#10B981",
      "--sidebar": "#01271f",
      "--sidebar-primary": "#10B981",
      "--info": "#34D399",
      "--chart-1": "#10B981",
    },
  },
  {
    id: "dark-midnight-orange",
    mode: "dark",
    name: "Midnight Orange",
    primary: "#F97316",
    surface: "#1F2937",
    cssVars: {
      "--background": "#111827",
      "--foreground": "#F9FAFB",
      "--card": "#1F2937",
      "--primary": "#F97316",
      "--accent": "#FDBA74",
      "--ring": "#F97316",
      "--sidebar": "#0d1420",
      "--sidebar-primary": "#F97316",
      "--info": "#FDBA74",
      "--chart-1": "#F97316",
    },
  },
  {
    id: "dark-indigo-tech",
    mode: "dark",
    name: "Indigo Tech",
    primary: "#6366F1",
    surface: "#1E293B",
    cssVars: {
      "--background": "#0B1120",
      "--foreground": "#E0E7FF",
      "--card": "#1E293B",
      "--primary": "#6366F1",
      "--accent": "#A5B4FC",
      "--ring": "#6366F1",
      "--sidebar": "#080e1b",
      "--sidebar-primary": "#6366F1",
      "--info": "#A5B4FC",
      "--chart-1": "#6366F1",
    },
  },
  {
    id: "dark-teal-minimal",
    mode: "dark",
    name: "Teal Minimal",
    primary: "#14B8A6",
    surface: "#134E4A",
    cssVars: {
      "--background": "#042F2E",
      "--foreground": "#CCFBF1",
      "--card": "#134E4A",
      "--primary": "#14B8A6",
      "--accent": "#5EEAD4",
      "--ring": "#14B8A6",
      "--sidebar": "#032927",
      "--sidebar-primary": "#14B8A6",
      "--info": "#5EEAD4",
      "--chart-1": "#14B8A6",
    },
  },
  {
    id: "dark-pure-black",
    mode: "dark",
    name: "Pure Black",
    primary: "#ffffff",
    surface: "#000000",
    cssVars: {
      "--background": "#000000",
      "--foreground": "#ffffff",
      "--card": "#0a0a0a",
      "--primary": "#ffffff",
      "--accent": "#ffffff",
      "--ring": "#ffffff",
      "--sidebar": "#050505",
      "--sidebar-primary": "#ffffff",
      "--info": "#ffffff",
      "--chart-1": "#ffffff",
    },
  },
];

const APPLIED_THEME_KEYS = new Set(
  THEME_PRESETS.flatMap((preset) => Object.keys(preset.cssVars))
);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function isThemePresetId(value: string | null): value is ThemePresetId {
  return THEME_PRESETS.some((preset) => preset.id === value);
}

export function getPresetsByMode(mode: ThemeMode) {
  return THEME_PRESETS.filter((preset) => preset.mode === mode);
}

export function applyThemePreferences(mode: ThemeMode, presetId: ThemePresetId) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const validPreset = THEME_PRESETS.find((preset) => preset.id === presetId && preset.mode === mode);
  const resolvedPreset = validPreset ? presetId : DEFAULT_THEME_PRESET[mode];
  const preset = THEME_PRESETS.find((item) => item.id === resolvedPreset);

  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
  root.dataset.theme = resolvedPreset;

  APPLIED_THEME_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });

  if (preset) {
    Object.entries(preset.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, resolvedPreset);
    window.dispatchEvent(
      new CustomEvent("intelliviz-theme-change", {
        detail: { mode, presetId: resolvedPreset },
      })
    );
  }
}

export function resolveInitialThemePreferences(): { mode: ThemeMode; presetId: ThemePresetId } {
  if (typeof window === "undefined") {
    return { mode: "dark", presetId: DEFAULT_THEME_PRESET.dark };
  }

  const storedModeRaw = window.localStorage.getItem(THEME_STORAGE_KEY);
  const inferredMode: ThemeMode = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const mode = isThemeMode(storedModeRaw) ? storedModeRaw : inferredMode;

  const storedPresetRaw = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);
  const presetIsValid = isThemePresetId(storedPresetRaw) && THEME_PRESETS.some((preset) => preset.id === storedPresetRaw && preset.mode === mode);

  const presetId = presetIsValid ? storedPresetRaw : DEFAULT_THEME_PRESET[mode];

  return { mode, presetId };
}

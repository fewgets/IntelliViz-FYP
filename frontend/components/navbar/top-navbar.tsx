"use client";

import { Bell, Moon, Sun, User, Settings, Key, LogOut, UserCircle, House, Wrench, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AlertsPanel } from "@/components/alerts/alerts-panel";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  applyThemePreferences,
  DEFAULT_THEME_PRESET,
  resolveInitialThemePreferences,
  type ThemeMode,
  type ThemePresetId,
} from "@/lib/theme";

const AI_RECOMMENDATION_CACHE_PREFIX = "intelliviz-ai-reco:";
const ANOMALY_ROOT_CAUSE_CACHE_PREFIX = "intelliviz-anomaly-root-cause:";
const ANOMALY_RECOMMENDATION_CACHE_PREFIX = "intelliviz-anomaly-recommendation:";

const TOP_NAV_TABS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/energy", label: "Power", icon: Zap },
  { href: "/production", label: "Analytics", icon: BarChart3 },
  { href: "/admin", label: "Settings", icon: Settings },
] as const;

export function TopNavbar() {
  const [presetId, setPresetId] = useState<ThemePresetId>(DEFAULT_THEME_PRESET.dark);
  const [showAlerts, setShowAlerts] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleDashboardSwitchTab = (href: string) => {
    if (pathname === href) return;
    router.push(href);
  };

  useEffect(() => {
    const resolved = resolveInitialThemePreferences();
    setPresetId(resolved.presetId);
    setTheme(resolved.mode);
  }, []);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode: ThemeMode; presetId: ThemePresetId }>;
      if (!customEvent.detail) return;
      setTheme(customEvent.detail.mode);
      setPresetId(customEvent.detail.presetId);
    };

    window.addEventListener("intelliviz-theme-change", handleThemeChange as EventListener);
    return () => {
      window.removeEventListener("intelliviz-theme-change", handleThemeChange as EventListener);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let index = 0; index < window.sessionStorage.length; index += 1) {
        const key = window.sessionStorage.key(index);
        if (
          key?.startsWith(AI_RECOMMENDATION_CACHE_PREFIX) ||
          key?.startsWith(ANOMALY_ROOT_CAUSE_CACHE_PREFIX) ||
          key?.startsWith(ANOMALY_RECOMMENDATION_CACHE_PREFIX)
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    }

    router.push("/dashboard");
  };

  const toggleTheme = () => {
    const currentTheme: ThemeMode = theme === "light" ? "light" : "dark";
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";
    const nextPreset =
      presetId.startsWith(nextTheme) ? presetId : DEFAULT_THEME_PRESET[nextTheme];
    setTheme(nextTheme);
    setPresetId(nextPreset);
    applyThemePreferences(nextTheme, nextPreset);
  };

  return (
    <>
      <header suppressHydrationWarning className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/75 px-3 backdrop-blur-xl sm:h-16 sm:px-4 lg:px-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="mr-2 flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-[10px] font-medium text-success sm:text-xs">LIVE</span>
        </div>

        {(pathname.startsWith("/dashboard") || pathname.startsWith("/maintenance") || pathname.startsWith("/energy") || pathname.startsWith("/production") || pathname.startsWith("/admin")) && (
          <div className="flex flex-1 justify-start pr-2 sm:justify-center sm:px-3">
            <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-background/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
              {TOP_NAV_TABS.map((tab) => {
                const active = pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => handleDashboardSwitchTab(tab.href)}
                  className={[
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(var(--primary),0.22)] ring-1 ring-primary/15"
                      : "text-muted-foreground ring-1 ring-transparent hover:bg-primary/10 hover:text-primary hover:ring-primary/20",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-muted-foreground hover:text-foreground"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[9px] font-bold sm:-right-1 sm:-top-1 sm:h-5 sm:w-5 sm:text-[10px]"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-10 w-10 sm:ml-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex cursor-pointer items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin?tab=theme" className="flex cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Theme Preferences
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex cursor-pointer items-center">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Alerts Panel */}
      <AlertsPanel open={showAlerts} onClose={() => setShowAlerts(false)} />
    </>
  );
}

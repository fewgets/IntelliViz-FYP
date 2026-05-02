"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Factory,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";
import { useEffect } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Machines", href: "/machines", icon: Factory },
  { title: "Maintenance", href: "/maintenance", icon: Brain },
  { title: "Energy", href: "/energy", icon: Zap },
  { title: "Production", href: "/production", icon: BarChart3 },
  { title: "AI Assistant", href: "/assistant", icon: Bot },
  { title: "Settings", href: "/admin", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border/80 bg-sidebar/95 shadow-[12px_0_40px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-200 ease-out",
          // Desktop behavior
          "hidden lg:block",
          collapsed ? "lg:w-[68px]" : "lg:w-64",
          // Mobile behavior
          mobileOpen && "block w-72"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border/80 px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-[0_10px_30px_color-mix(in_oklch,var(--primary),transparent_55%)]">
                <Activity className="h-5 w-5 text-primary-foreground" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-sidebar-foreground">
                    IntelliViz
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                    Industrial Platform
                  </span>
                </div>
              )}
            </Link>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="h-10 w-10 text-sidebar-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-accent text-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                      : "text-sidebar-foreground/72 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-105", isActive && "text-primary")} />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );

              if (collapsed && !mobileOpen) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>

          {/* Collapse Button - Desktop only */}
          <div className="hidden border-t border-sidebar-border p-3 lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="w-full justify-center rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-2">Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(true)}
      className="lg:hidden"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}

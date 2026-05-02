"use client";

import { TopNavbar } from "@/components/navbar/top-navbar";
import { FloatingChatbot } from "@/components/ai-chatbot/floating-chatbot";
import { SidebarProvider } from "@/components/sidebar/sidebar-context";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getRouteAccent = () => {
    if (pathname.startsWith("/energy")) return "route-accent-energy";
    if (pathname.startsWith("/production")) return "route-accent-production";
    if (pathname.startsWith("/security")) return "route-accent-security";
    if (pathname.startsWith("/maintenance")) return "route-accent-maintenance";
    if (pathname.startsWith("/machines")) return "route-accent-machines";
    if (pathname.startsWith("/assistant")) return "route-accent-assistant";
    if (pathname.startsWith("/admin")) return "route-accent-admin";
    return "route-accent-dashboard";
  };
  
  return (
    <div className={cn("min-h-screen bg-background", getRouteAccent())} suppressHydrationWarning>
      <div className="transition-all duration-200 ease-out">
        <TopNavbar />
        <main suppressHydrationWarning className="page-transition min-h-[calc(100vh-3.5rem)] p-3 sm:min-h-[calc(100vh-4rem)] sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
      <FloatingChatbot />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-background" suppressHydrationWarning>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.14),transparent_56%)]" />
        <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.12),transparent_70%)] blur-3xl" />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, Cpu, Droplets, Lightbulb, Lock, Shield } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layout8020 } from '@/components/Layout80-20';
import { StatusBadge } from '@/components/StatusBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getChartColors } from '@/lib/chartTheme';
import { DUMMY_MACHINES, getRepresentativeMachines } from '@/lib/types';

export default function OverviewPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const colors = getChartColors(isDark);
  const representativeMachines = getRepresentativeMachines();

  const machineData: Record<string, { icon: React.ReactNode; description: string }> = {
    'CNC Machine': { icon: <Cpu className="h-4 w-4" />, description: 'Precision cutting and shaping' },
    Pump: { icon: <Droplets className="h-4 w-4" />, description: 'Fluid movement control' },
    Compressor: { icon: <AlertTriangle className="h-4 w-4" />, description: 'Air pressurization system' },
    'Robotic Arm': { icon: <Shield className="h-4 w-4" />, description: 'Automated assembly' },
  };

  const featureCards = [
    { icon: <BarChart3 className="h-4 w-4" />, label: 'Real-time Monitoring', href: '/dashboard' },
    { icon: <Cpu className="h-4 w-4" />, label: 'Predictive Maintenance', href: '/maintenance' },
    { icon: <Lightbulb className="h-4 w-4" />, label: 'Analytics', href: '/production' },
    { icon: <AlertTriangle className="h-4 w-4" />, label: 'Power Consumption', href: '/energy' },
  ];

  const efficiencyData = representativeMachines.map((machine) => ({
    name: machine.name.split(' ')[0],
    value: machine.efficiency,
  }));

  const statusCounts = {
    healthy: DUMMY_MACHINES.filter((machine) => machine.status === 'healthy').length,
    warning: DUMMY_MACHINES.filter((machine) => machine.status === 'warning').length,
    critical: DUMMY_MACHINES.filter((machine) => machine.status === 'critical').length,
  };

  const leftContent = (
    <div className="h-full flex flex-col overflow-visible lg:overflow-hidden lg:rounded-tr-3xl lg:rounded-br-3xl rounded-b-3xl lg:rounded-b-none bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 flex flex-col gap-4 overflow-visible lg:overflow-hidden px-4 sm:px-6 py-4">
        <div className="flex-shrink-0 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-2xl font-bold text-slate-900 dark:text-white">Hello, Dashboard!</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">IoT StreamGuard system overview</p>
          </div>
        </div>

        <div className="relative flex-shrink-0 h-32 overflow-visible rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
          <div className="flex h-full items-center gap-4 px-5">
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <h2 className="mb-1 text-lg font-bold leading-tight text-white">IoT StreamGuard</h2>
              <p className="text-xs text-white/90 line-clamp-2">Real-time monitoring for industrial devices</p>
            </div>
            <div className="hidden sm:block absolute bottom-0 right-2 lg:right-6 h-40 w-56 lg:h-52 lg:w-72 flex-shrink-0">
              <img src="/img_animated.png" alt="IoT Illustration" className="h-full w-full object-cover rounded-xl shadow-2xl" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {featureCards.map((card, index) => (
            <Link href={card.href} key={index} className="group flex flex-col justify-center cursor-pointer rounded-xl border border-blue-100 bg-white p-4 lg:p-5 h-28 lg:h-32 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600 transition-transform group-hover:scale-110 dark:from-cyan-900 dark:to-blue-900 dark:text-cyan-400">
                  {card.icon}
                </div>
                <h3 className="line-clamp-2 text-center text-xs lg:text-sm font-semibold leading-tight text-slate-900 dark:text-white">{card.label}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex-1 rounded-xl border border-blue-100 bg-white p-4 sm:p-5 shadow-md dark:border-slate-700 dark:bg-slate-800 flex flex-col min-h-[300px] lg:min-h-0">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white flex-shrink-0">Efficiency Comparison</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                <XAxis dataKey="name" stroke={colors.axisStroke} fontSize={11} />
                <YAxis stroke={colors.axisStroke} fontSize={11} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" name="Efficiency %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const rightContent = (
    <div className="relative h-full flex flex-col overflow-visible lg:overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/50 to-cyan-50/30 dark:from-slate-850 dark:via-slate-800/80 dark:to-slate-900">
      {/* System Status Card - Top */}
      <div className="flex-shrink-0 p-3">
        <div className="rounded-xl border border-blue-100/40 bg-gradient-to-br from-white/70 to-cyan-50/50 p-3 shadow-md backdrop-blur-md dark:border-slate-600/40 dark:from-slate-800/70 dark:to-slate-700/50">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">System Status</h3>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 p-2 dark:from-emerald-950/40 dark:to-emerald-900/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">✓</div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Healthy</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 pl-1">{statusCounts.healthy}</div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-2 dark:from-amber-950/40 dark:to-amber-900/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">⚠</div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Warning</span>
              </div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 pl-1">{statusCounts.warning}</div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-red-50/50 to-red-100/30 p-2 dark:from-red-950/40 dark:to-red-900/20">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-red-600 dark:text-red-400">!</div>
                <span className="text-xs font-semibold text-red-700 dark:text-red-300">Critical</span>
              </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400 pl-1">{statusCounts.critical}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Machines List */}
      <div className="flex-1 overflow-visible lg:overflow-hidden px-3 pb-3 flex flex-col">
        <div className="space-y-3 flex flex-col">
          {getRepresentativeMachines().map((machine) => {
            const machineInfo = machineData[machine.name];

            const statusStyles = {
              healthy: {
                bg: 'from-emerald-500/20 to-emerald-600/10',
                iconBg: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
                icon: '✓',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
              },
              warning: {
                bg: 'from-amber-500/20 to-amber-600/10',
                iconBg: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40',
                icon: '⚠',
                iconColor: 'text-amber-600 dark:text-amber-400',
              },
              critical: {
                bg: 'from-red-500/20 to-red-600/10',
                iconBg: 'from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40',
                icon: '!',
                iconColor: 'text-red-600 dark:text-red-400',
              },
            };

            const style = statusStyles[machine.status as keyof typeof statusStyles];

            return (
              <Link
                key={machine.id}
                href={`/dashboard?type=${encodeURIComponent(machine.name)}`}
                className="group relative block cursor-pointer overflow-hidden rounded-lg border border-blue-100/50 bg-white/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-cyan-400/60 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-600/50 dark:bg-slate-700/40 dark:hover:border-cyan-500/60"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <span className={`${style.iconColor} text-lg font-bold`}>{style.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{machine.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{machineInfo.description}</p>
                      </div>
                    </div>
                    <StatusBadge status={machine.status} />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex gap-3 text-xs">
                      <div className="flex flex-col">
                        <span className="text-slate-500 dark:text-slate-400">RUL</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {machine.status === 'healthy' ? '1240h' : machine.status === 'warning' ? '320h' : '48h'}
                        </span>
                      </div>
                      <div className="w-px bg-slate-300/50 dark:bg-slate-600/50" />
                      <div className="flex flex-col">
                        <span className="text-slate-500 dark:text-slate-400">Eff</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{machine.efficiency}%</span>
                      </div>
                    </div>
                    <div className="flex h-6 w-12 items-center gap-1 rounded-full bg-slate-200/40 px-2 dark:bg-slate-600/40">
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                      <div className="h-1 w-1 rounded-full bg-slate-300/50 dark:bg-slate-500/50" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <Layout8020 left={leftContent} right={rightContent} rightWidth="28%" minHeight="min-h-screen lg:h-screen" />
    </div>
  );
}

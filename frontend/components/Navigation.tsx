'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Cpu, Zap, Wrench, Shield, Eye } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/machines', label: 'Machines', icon: Cpu },
  { href: '/energy', label: 'Energy', icon: Zap },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
];

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-cyan-500 via-blue-500 to-blue-600 dark:from-cyan-600 dark:via-blue-700 dark:to-blue-800 backdrop-blur-md z-40 flex flex-col items-center py-6 gap-4 shadow-lg">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors mb-2">
        <Eye className="w-6 h-6 text-white" />
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-white/20 mb-2" />

      {/* Navigation Links - Vertical */}
      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-white text-blue-600 shadow-lg scale-105'
                  : 'text-white hover:bg-white/20'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Gauge,
  FolderKanban,
  ListChecks,
  FileText,
  Users,
  Settings,
  Zap,
} from 'lucide-react';

export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Gauge },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: ListChecks },
  { name: 'Files', href: '/files', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-72 flex-col border-r border-white/5 bg-slate-950/40 px-6 py-8 backdrop-blur lg:flex">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-lg shadow-sky-500/10 backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-lg font-semibold text-white shadow-lg">
            OH
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-50">OpsHub</p>
            <p className="text-xs text-slate-300/80">Operations Control Center</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-6">
          <div className="space-y-1.5">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400/80">
              Menu
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                    isActive
                      ? 'bg-white/10 text-white shadow-inner shadow-sky-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-all duration-200',
                    isActive ? 'border-sky-400/60 text-white shadow shadow-sky-500/30' : 'group-hover:border-white/30'
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-slate-100 backdrop-blur-lg shadow-xl shadow-indigo-500/10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
              <Zap className="h-4 w-4" />
              Boost Workflow
            </div>
            <p className="text-sm font-semibold leading-snug text-white">Upgrade to OpsHub Pro</p>
            <p className="mt-1 text-xs text-slate-300/80">
              Unlock insights, automations, and premium analytics.
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.01] hover:shadow-sky-500/60"
            >
              Explore Plans
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}

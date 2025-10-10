"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TenantSwitcher } from './tenant-switcher';
import { navigation } from './sidebar';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';

function formatDisplayName(
  user?: { firstName?: string | null; lastName?: string | null; username?: string },
) {
  if (user?.firstName || user?.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }
  return user?.username ?? 'Operator';
}

function deriveInitials(
  user?: { firstName?: string | null; lastName?: string | null; username?: string },
) {
  if (user?.firstName || user?.lastName) {
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    const combined = `${first}${last}`.trim();
    return combined ? combined.toUpperCase() : 'OP';
  }
  return user?.username?.slice(0, 2).toUpperCase() ?? 'OP';
}

export function Topbar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const displayName = formatDisplayName({
    firstName: user?.firstName ?? undefined,
    lastName: user?.lastName ?? undefined,
    username: user?.username,
  });

  const initials = deriveInitials({
    firstName: user?.firstName ?? undefined,
    lastName: user?.lastName ?? undefined,
    username: user?.username,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 px-6 py-4 backdrop-blur lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400/80">
            <span className="inline-flex h-6 w-1.5 rounded-full bg-gradient-to-b from-sky-500 via-blue-500 to-indigo-500" />
            Ops Intelligence
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {`Welcome back, ${displayName}`}
            </h1>
            <p className="mt-1 text-sm text-slate-300/80">
              Monitor your organisation’s performance and move work forward with real-time insights.
            </p>
          </div>
          <div className="grid gap-2 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              {navigation.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/30 hover:text-white',
                      isActive && 'border-sky-400/40 bg-white/10 text-white shadow shadow-sky-500/20',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navigation.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/30 hover:text-white',
                      isActive && 'border-sky-400/40 bg-white/10 text-white shadow shadow-sky-500/20',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <TenantSwitcher />
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 backdrop-blur">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
              {initials}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-white">{displayName}</span>
              <span className="text-xs text-slate-300/80">
                {user?.role ? user.role.replace(/_/g, ' ').toLowerCase() : 'team member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

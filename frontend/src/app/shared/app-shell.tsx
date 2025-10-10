"use client";

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { GlobalHeader } from './global-header';

const AUTH_ROUTE_PREFIXES = ['/login', '/register'];

function shouldHideHeader(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeader = shouldHideHeader(pathname);

  const containerClasses = [
    'relative',
    'mx-auto',
    'flex',
    'min-h-screen',
    'w-full',
    'max-w-[120rem]',
    'flex-col',
    'px-4',
    'pb-12',
    hideHeader ? 'pt-10' : 'pt-20',
    'sm:px-8',
    'lg:px-12',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[95rem] bg-gradient-to-b from-white/5 via-transparent to-transparent blur-3xl"></div>
      {hideHeader ? null : <GlobalHeader />}
      {children}
    </div>
  );
}

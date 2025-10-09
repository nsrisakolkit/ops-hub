"use client";

import { ReactNode } from 'react';
import { Topbar } from './topbar';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-[-40%] h-[480px] rounded-full bg-gradient-to-r from-sky-500/40 via-blue-500/30 to-indigo-500/30 blur-3xl" />
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="relative z-10 flex-1 overflow-y-auto px-6 pb-12 pt-8 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

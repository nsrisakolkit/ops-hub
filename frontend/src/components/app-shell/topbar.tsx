"use client";

import { TenantSwitcher } from './tenant-switcher';

export function Topbar() {
  return (
    <div className="topbar">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <TenantSwitcher />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <span className="text-sm font-medium text-slate-700">Welcome back!</span>
        </div>
      </div>
    </div>
  );
}
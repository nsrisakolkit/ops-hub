"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const tenants = [
  { id: '1', name: 'Default Tenant', slug: 'default' },
  { id: '2', name: 'ACME Corp', slug: 'acme' },
  { id: '3', name: 'Tech Solutions', slug: 'tech-solutions' },
];

export function TenantSwitcher() {
  const [currentTenant, setCurrentTenant] = useState(tenants[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-56 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-lg shadow-indigo-500/10 backdrop-blur transition hover:bg-white/10 hover:text-white"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/10">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-semibold text-white">
              {currentTenant.name}
            </span>
            <span className="text-xs text-slate-300/70">@{currentTenant.slug}</span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-sky-500/20 backdrop-blur-xl z-50">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => {
                setCurrentTenant(tenant);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-150',
                'hover:bg-white/10 hover:text-white focus-visible:outline-none',
                currentTenant.id === tenant.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-200'
              )}
            >
              <span className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10',
                currentTenant.id === tenant.id ? 'bg-white/15' : 'bg-white/5'
              )}>
                <Building2 className="h-4 w-4" />
              </span>
              <div className="flex-1 leading-tight">
                <div className="font-semibold">{tenant.name}</div>
                <div className="text-xs text-slate-300/70">{tenant.slug}</div>
              </div>
              {currentTenant.id === tenant.id && (
                <span className="text-xs font-semibold uppercase tracking-widest text-sky-300">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

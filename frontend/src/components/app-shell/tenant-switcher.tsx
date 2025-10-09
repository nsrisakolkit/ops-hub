"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
        className="justify-between w-48 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{currentTenant.name}</span>
        <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => {
                setCurrentTenant(tenant);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                currentTenant.id === tenant.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
              }`}
            >
              <div className="font-medium">{tenant.name}</div>
              <div className="text-xs text-slate-500">{tenant.slug}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
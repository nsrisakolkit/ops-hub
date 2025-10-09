"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Tasks', href: '/tasks', icon: '✅' },
  { name: 'Files', href: '/files', icon: '📄' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">OpsHub</h2>
          <p className="text-sm text-slate-500">Operations Dashboard</p>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'nav-link',
                pathname === item.href ? 'active' : ''
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
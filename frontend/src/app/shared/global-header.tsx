import Link from 'next/link';
import { LogoutButton } from '../projects/logout-button';

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
    >
      {label}
    </Link>
  );
}

export function GlobalHeader() {
  return (
    <header className="sticky top-4 z-50 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 shadow-lg shadow-sky-900/40 backdrop-blur">
      <nav className="flex items-center gap-2">
        <NavLink href="/projects" label="Projects" />
        <NavLink href="/tasks" label="Tasks" />
      </nav>
      <LogoutButton />
    </header>
  );
}

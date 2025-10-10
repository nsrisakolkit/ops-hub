"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Enterprise-grade control',
    description: 'Multi-tenant access policies, audit trails, and SSO baked in.',
  },
  {
    icon: Lock,
    title: 'Zero friction onboarding',
    description: 'Provision teams and automate workflows in minutes, not days.',
  },
  {
    icon: CheckCircle2,
    title: 'Operational clarity',
    description: 'Realtime signals and KPIs to keep delivery aligned and on track.',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        const message = (typeof result === 'string' && result) ||
          (Array.isArray(result?.message)
            ? result.message.join(', ')
            : typeof result?.message === 'string'
              ? result.message
              : typeof result?.error === 'string'
                ? result.error
                : typeof result?.message === 'object' && result?.message !== null
                  ? JSON.stringify(result.message)
                  : 'Authentication failed');
        setErrorMessage(message);
      }
    } catch (error) {
      setErrorMessage('Unable to contact authentication service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-sky-500/30 via-blue-500/20 to-emerald-500/20 blur-3xl" />
        <div className="absolute -right-16 top-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-slate-900/60 blur-3xl" />
        <div className="absolute inset-x-0 bottom-[-40%] h-[560px] rounded-full bg-gradient-to-t from-slate-900 via-slate-950 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-slate-900/60 p-12 text-slate-100 backdrop-blur-xl lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)] opacity-60" />
          <div className="relative space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100">
              <Sparkles className="h-4 w-4" />
              OpsHub
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
                Command the flow of work with precision and harmony.
              </h1>
              <p className="max-w-lg text-sm text-slate-100/80">
                OpsHub unifies projects, teams, and insights into a single pane of clarity.
                Activate automation, surface blockers, and keep delivery teams aligned—on every mission.
              </p>
            </div>
          </div>

          <div className="relative space-y-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100 shadow-xl shadow-sky-500/10"
                >
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{benefit.title}</p>
                    <p className="text-xs text-slate-100/70">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-slate-100/80">
            OpsHub © {new Date().getFullYear()} • Operating with security, transparency, and velocity.
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md space-y-10 rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 text-sm text-slate-200 shadow-2xl shadow-indigo-500/15 backdrop-blur-xl sm:px-10">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
                Secure Access Control
              </div>
              <h2 className="text-2xl font-semibold text-white">Sign in to OpsHub</h2>
              <p className="text-xs text-slate-300/80">
                Authenticate with your enterprise credentials to continue to the mission control dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300/80">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="h-12 rounded-xl border border-white/10 bg-white/[0.07] text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300/80">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border border-white/10 bg-white/[0.07] text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-sky-200 transition hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl border border-white/20 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.01]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300/80">
              <span className="font-semibold text-slate-200">Need access?</span>
              <span>
                Reach out to your OpsHub administrator or{' '}
                <button type="button" className="font-semibold text-sky-200 underline-offset-4 hover:text-white hover:underline">
                  request a workspace
                </button>
                .
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

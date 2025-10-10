'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        router.replace('/projects');
        router.refresh();
        return;
      }

      const message =
        (typeof result === 'string' && result) ||
        (Array.isArray(result?.message)
          ? result.message.join(', ')
          : typeof result?.message === 'string'
          ? result.message
          : typeof result?.error === 'string'
          ? result.error
          : typeof result?.message === 'object' && result?.message !== null
          ? JSON.stringify(result.message)
          : 'Unable to authenticate.');

      setErrorMessage(message);
    } catch (error) {
      setErrorMessage('Unable to contact authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-slate-100">
      <div className="glass-panel w-full max-w-md p-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300/90">
            Welcome Back
          </p>
          <h1 className="text-3xl font-semibold text-white">Sign in to OpsHub</h1>
          <p className="text-sm text-slate-300/80">
            Rejoin your teams, monitor progress, and keep initiatives moving.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="flex-1 rounded-xl border border-sky-400/40 bg-white/5 px-4 py-3 text-sm font-semibold text-sky-200 shadow shadow-sky-500/10 transition hover:bg-sky-500/15 hover:text-white"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

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

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        router.replace('/projects');
        router.refresh();
        return;
      }

      const message =
        (typeof payload === 'string' && payload) ||
        (Array.isArray(payload?.message)
          ? payload.message.join(', ')
          : typeof payload?.message === 'string'
          ? payload.message
          : typeof payload?.error === 'string'
          ? payload.error
          : typeof payload?.message === 'object' && payload?.message !== null
          ? JSON.stringify(payload.message)
          : 'Unable to authenticate.');

      setErrorMessage(message);
    } catch (error) {
      setErrorMessage('Unable to contact authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-sky-500/10 backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-semibold text-white">Sign in</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}

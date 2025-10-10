'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormState = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          confirmPassword: form.confirmPassword,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        router.replace('/login');
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
              : typeof payload?.details === 'string'
                ? payload.details
                : 'Unable to register user.');

      setErrorMessage(message);
    } catch {
      setErrorMessage('Unable to contact registration service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-slate-100">
      <div className="glass-panel w-full max-w-3xl space-y-8 p-10">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300/90">
            Create Account
          </p>
          <h1 className="text-3xl font-semibold text-white">Welcome to OpsHub</h1>
          <p className="text-sm text-slate-300/80">
            Set up your workspace profile to start collaborating with your teams.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange('firstName')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange('lastName')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={form.username}
              onChange={handleChange('username')}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange('password')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-white shadow-inner shadow-white/5 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </div>
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
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="flex-1 rounded-xl border border-sky-400/40 bg-white/5 px-4 py-3 text-sm font-semibold text-sky-200 shadow shadow-sky-500/10 transition hover:bg-sky-500/15 hover:text-white"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

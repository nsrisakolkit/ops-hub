"use client";

import { FormEvent, useState } from 'react';

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/users/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const payload = await response.json().catch(() => null);

    setPending(false);

    if (!response.ok) {
      const message =
        typeof payload?.message === 'string'
          ? payload.message
          : typeof payload?.error === 'string'
            ? payload.error
            : 'Unable to update password.';
      setError(message);
      return;
    }

    setSuccess('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-purple-900/20">
      <header>
        <h2 className="text-lg font-semibold text-white">Security</h2>
        <p className="text-sm text-slate-300/80">
          Change your password regularly to keep your account secure.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="text-sm text-slate-200">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
            Current password
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
              New password
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/40"
            />
          </label>

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/40"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            {success}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-purple-500/20 transition hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </section>
  );
}

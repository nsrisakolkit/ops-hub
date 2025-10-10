"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface ProfileFormProps {
  initial: {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initial.email);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
        ...(avatar.trim() ? { avatar: avatar.trim() } : {}),
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
            : 'Unable to update profile.';
      setError(message);
      return;
    }

    setSuccess('Profile updated successfully.');
    router.refresh();
  };

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-sky-900/20">
      <header>
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="text-sm text-slate-300/80">
          Update your contact details. Usernames and roles are managed by administrators.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            />
          </label>
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Username</span>
            <input
              type="text"
              value={initial.username}
              readOnly
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-400"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            />
          </label>

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            />
          </label>
        </div>

        <label className="text-sm text-slate-200">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Avatar URL</span>
          <input
            type="url"
            value={avatar}
            onChange={(event) => setAvatar(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            placeholder="https://cdn.opshub.com/avatars/me.png"
          />
        </label>

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
            className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

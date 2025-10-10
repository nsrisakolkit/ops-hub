"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { createProject } from './project-api';

interface FormState {
  name: string;
  description: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: '',
  description: '',
};

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return pending || form.name.trim().length === 0;
  }, [form.name, pending]);

  const handleOpen = () => {
    setForm(INITIAL_FORM_STATE);
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (pending) return;
    setOpen(false);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError('Project name is required.');
      return;
    }

    setPending(true);
    setError(null);

    const result = await createProject({
      name,
      ...(description ? { description } : {}),
    });

    setPending(false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      setError(result.message);
      return;
    }

    setOpen(false);
    setForm(INITIAL_FORM_STATE);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 shadow shadow-sky-500/20 transition hover:bg-sky-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/60"
      >
        New Project
      </button>

      {open ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
            className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-sky-500/20"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-start justify-between">
              <div>
                <h2 id="new-project-title" className="text-lg font-semibold text-white">
                  Create new project
                </h2>
                <p className="text-sm text-slate-300/80">
                  Provide a name and optional description to spin up a project.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-slate-200">
                  Project name
                </label>
                <input
                  id="project-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, name: event.target.value }));
                  }}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Product launch revamp"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-slate-200"
                >
                  Description <span className="text-xs text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="project-description"
                  name="description"
                  value={form.description}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, description: event.target.value }));
                  }}
                  className="mt-1 h-24 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Outline the key goals or context for this initiative."
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

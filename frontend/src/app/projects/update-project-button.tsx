"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { PROJECT_STATUSES } from './types';
import { updateProject } from './project-api';

interface UpdateProjectButtonProps {
  projectId: string;
  name: string;
  description?: string | null;
  status: string;
}

interface FormState {
  name: string;
  description: string;
  status: string;
}

export function UpdateProjectButton({
  projectId,
  name,
  description,
  status,
}: UpdateProjectButtonProps) {
  const normalisedStatus = PROJECT_STATUSES.includes(
    status as (typeof PROJECT_STATUSES)[number],
  )
    ? status
    : PROJECT_STATUSES[0];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name,
    description: description ?? '',
    status: normalisedStatus,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return pending || form.name.trim().length === 0;
  }, [form.name, pending]);

  const handleOpen = () => {
    setForm({
      name,
      description: description ?? '',
      status: normalisedStatus,
    });
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

    const nextName = form.name.trim();
    if (!nextName) {
      setError('Project name is required.');
      return;
    }

    setPending(true);
    setError(null);

    const payload: Record<string, unknown> = { name: nextName };
    const descriptionValue = form.description.trim();
    payload.description = descriptionValue.length > 0 ? descriptionValue : null;
    payload.status = form.status;

    const result = await updateProject(projectId, payload);

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
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
      >
        Update Project
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
            aria-labelledby="update-project-title"
            className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-sky-500/20"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-start justify-between">
              <div>
                <h2 id="update-project-title" className="text-lg font-semibold text-white">
                  Update project
                </h2>
                <p className="text-sm text-slate-300/80">
                  Adjust project metadata and lifecycle status.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
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
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
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
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 h-24 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Outline the key goals or context for this initiative."
                />
              </div>

              <div>
                <label htmlFor="project-status" className="block text-sm font-medium text-slate-200">
                  Status
                </label>
                <select
                  id="project-status"
                  name="status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                >
                  {PROJECT_STATUSES.map((projectStatus) => (
                    <option key={projectStatus} value={projectStatus}>
                      {projectStatus}
                    </option>
                  ))}
                </select>
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
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

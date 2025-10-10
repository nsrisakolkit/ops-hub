"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import { createTask } from './project-api';
import type { ProjectMember } from './types';
import { TASK_PRIORITIES, TASK_STATUSES } from './types';

interface TaskFormState {
  title: string;
  description: string;
  status: (typeof TASK_STATUSES)[number];
  priority: (typeof TASK_PRIORITIES)[number];
  assigneeId: string;
  dueDate: string;
}

const INITIAL_FORM_STATE: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
};

interface NewTaskButtonProps {
  projectId: string;
  members: ProjectMember[];
}

function memberLabel(member: ProjectMember): string {
  const fullName = [member.user.firstName, member.user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (member.user.username) return member.user.username;
  if (member.user.email) return member.user.email ?? member.userId;
  return member.userId;
}

export function NewTaskButton({ projectId, members }: NewTaskButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM_STATE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const isSubmitDisabled = useMemo(() => pending || form.title.trim().length === 0, [pending, form.title]);

  const handleOpen = () => {
    setForm(INITIAL_FORM_STATE);
    setError(null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setError(null);
  };

  const handleClose = () => {
    if (pending) return;
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const title = form.title.trim();
    if (!title) {
      setError('Task title is required.');
      return;
    }

    setPending(true);
    setError(null);

    const dueDateIso = form.dueDate ? new Date(`${form.dueDate}T00:00:00Z`).toISOString() : null;

    const result = await createTask({
      projectId,
      title,
      status: form.status,
      priority: form.priority,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.assigneeId ? { assigneeId: form.assigneeId } : {}),
      ...(dueDateIso ? { dueDate: dueDateIso } : {}),
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

    setForm(INITIAL_FORM_STATE);
    closeModal();
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-200 shadow shadow-sky-500/20 transition hover:bg-sky-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/60"
      >
        New Task
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
            aria-labelledby="new-task-title"
            className="w-full max-w-xl rounded-xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-sky-500/20"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-start justify-between">
              <div>
                <h2 id="new-task-title" className="text-lg font-semibold text-white">
                  Create new task
                </h2>
                <p className="text-sm text-slate-300/80">
                  Track upcoming work items for this project.
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
                <label htmlFor="task-title" className="block text-sm font-medium text-slate-200">
                  Title
                </label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Draft launch plan"
                  required
                />
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-slate-200">
                  Description <span className="text-xs text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="mt-1 h-24 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Capture context, requirements, or acceptance criteria."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-slate-200">
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as TaskFormState['status'] }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-slate-200">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: event.target.value as TaskFormState['priority'],
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-200">
                    Assignee <span className="text-xs text-slate-400">(optional)</span>
                  </label>
                  <select
                    id="task-assignee"
                    name="assignee"
                    value={form.assigneeId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, assigneeId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {memberLabel(member)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-200">
                    Due date <span className="text-xs text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="task-due-date"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
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
                  {pending || isRefreshing ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

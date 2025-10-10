"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import { deleteTask, updateTask, type UpdateTaskResult } from '../projects/project-api';
import type { ProjectMember, TaskDetail } from '../projects/types';
import { TASK_PRIORITIES, TASK_STATUSES } from '../projects/types';

interface TaskDetailClientProps {
  task: TaskDetail;
  members: ProjectMember[];
  canUpdate: boolean;
  canDelete: boolean;
  projectHref: string;
}

interface FormState {
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string;
  dueDate: string;
}

function memberLabel(member: ProjectMember): string {
  const fullName = [member.user.firstName, member.user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (member.user.username) return member.user.username;
  if (member.user.email) return member.user.email ?? member.userId;
  return member.userId;
}

function normaliseStatus(value: string): string {
  const upper = value.toUpperCase();
  return TASK_STATUSES.includes(upper as (typeof TASK_STATUSES)[number]) ? upper : 'TODO';
}

function normalisePriority(value: string | null): string {
  if (!value) return 'MEDIUM';
  const upper = value.toUpperCase();
  return TASK_PRIORITIES.includes(upper as (typeof TASK_PRIORITIES)[number]) ? upper : 'MEDIUM';
}

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function TaskDetailClient({
  task,
  members,
  canUpdate,
  canDelete,
  projectHref,
}: TaskDetailClientProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  const initialForm = useMemo<FormState>(
    () => ({
      title: task.title,
      description: task.description ?? '',
      status: normaliseStatus(task.status),
      priority: normalisePriority(task.priority),
      assigneeId: task.assignee?.id ?? '',
      dueDate: toDateInputValue(task.dueDate),
    }),
    [task],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [updatePending, setUpdatePending] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(initialForm);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canUpdate || updatePending) {
      return;
    }

    const title = form.title.trim();
    if (!title) {
      setUpdateError('Title is required.');
      return;
    }

    setUpdatePending(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    const description = form.description.trim();
    const payload = {
      title,
      description: description.length ? description : undefined,
      status: form.status,
      priority: form.priority,
      assigneeId: form.assigneeId ? form.assigneeId : null,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00Z`).toISOString() : undefined,
    };

    const result: UpdateTaskResult = await updateTask(task.id, payload);

    setUpdatePending(false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      setUpdateError(result.message);
      return;
    }

    setUpdateSuccess('Task updated successfully.');
    startRefresh(() => {
      router.refresh();
    });
  };

  const handleDelete = async () => {
    if (!canDelete || deletePending) {
      return;
    }

    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletePending(true);
    setDeleteError(null);

    const result = await deleteTask(task.id);

    setDeletePending(false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      setDeleteError(result.message);
      return;
    }

    startRefresh(() => {
      router.replace(projectHref);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-6 md:grid-cols-2">
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Task ID</dt>
          <dd className="font-mono text-sm text-slate-200">{task.id}</dd>
        </dl>
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Project</dt>
          <dd className="text-slate-200">{task.project.name}</dd>
        </dl>
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</dt>
          <dd className="text-slate-200">{new Date(task.createdAt).toLocaleString()}</dd>
        </dl>
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Updated</dt>
          <dd className="text-slate-200">{new Date(task.updatedAt).toLocaleString()}</dd>
        </dl>
      </section>

      {canUpdate ? (
        <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Update task</h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-slate-400 underline-offset-4 transition hover:text-white hover:underline"
              disabled={updatePending || isRefreshing}
            >
              Reset
            </button>
          </header>

          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-200">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  required
                  disabled={updatePending || isRefreshing}
                />
              </label>

              <label className="text-sm text-slate-200">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Assignee</span>
                <select
                  value={form.assigneeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, assigneeId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  disabled={updatePending || isRefreshing}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {memberLabel(member)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm text-slate-200">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-1 h-28 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                placeholder="Add more context or acceptance criteria"
                disabled={updatePending || isRefreshing}
              />
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm text-slate-200">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  disabled={updatePending || isRefreshing}
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-200">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  disabled={updatePending || isRefreshing}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-200">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Due date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                  disabled={updatePending || isRefreshing}
                />
              </label>
            </div>

            {updateError ? (
              <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {updateError}
              </p>
            ) : null}

            {updateSuccess ? (
              <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
                {updateSuccess}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={updatePending || isRefreshing}
                className="inline-flex items-center rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatePending || isRefreshing ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {canDelete ? (
        <section className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Danger zone</h2>
              <p className="text-xs text-red-200/80">Permanently remove this task from the project.</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending || isRefreshing}
              className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 shadow shadow-red-500/30 transition hover:bg-red-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletePending || isRefreshing ? 'Deleting…' : 'Delete task'}
            </button>
          </header>
          {deleteError ? (
            <p className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-100/90">
              {deleteError}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

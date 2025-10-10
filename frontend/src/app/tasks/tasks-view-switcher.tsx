"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatDateTime } from '../projects/project-utils';
import type { ProjectTask } from '../projects/types';
import { TASK_PRIORITIES, TASK_STATUSES } from '../projects/types';

interface TasksViewSwitcherProps {
  tasks: ProjectTask[];
}

type ViewMode = 'table' | 'kanban';

const VIEW_LABELS: Record<ViewMode, string> = {
  table: 'Table',
  kanban: 'Kanban',
};

export function TasksViewSwitcher({ tasks }: TasksViewSwitcherProps) {
  const [view, setView] = useState<ViewMode>('table');

  const priorityRank = useMemo(() => {
    const rank = new Map<string, number>();
    TASK_PRIORITIES.forEach((priority, index) => {
      rank.set(priority, index);
    });
    return rank;
  }, []);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const status of TASK_STATUSES) {
      map.set(status, []);
    }
    for (const task of tasks) {
      const list = map.get(task.status) ?? [];
      list.push(task);
      map.set(task.status, list);
    }
    for (const status of TASK_STATUSES) {
      const list = map.get(status);
      if (!list) continue;
      list.sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        if (aDue !== bDue) {
          return aDue - bDue;
        }
        const aPriority = priorityRank.get((a.priority ?? 'MEDIUM').toUpperCase()) ?? Number.MAX_SAFE_INTEGER;
        const bPriority = priorityRank.get((b.priority ?? 'MEDIUM').toUpperCase()) ?? Number.MAX_SAFE_INTEGER;
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return a.title.localeCompare(b.title);
      });
    }
    return map;
  }, [tasks, priorityRank]);

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300/80">
        No tasks assigned to you yet.
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300/80">
          Showing {tasks.length} task{tasks.length === 1 ? '' : 's'} assigned to you.
        </p>
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 text-sm font-medium text-slate-200">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-md px-3 py-1 ${view === mode ? 'bg-sky-500/30 text-white shadow shadow-sky-500/30' : 'hover:bg-white/10 hover:text-white'}`}
            >
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300/80">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Project
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Due
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="inline-flex items-center gap-2 text-sky-300 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {task.project?.id ? (
                      <Link
                        href={`/projects/${task.project.id}`}
                        className="text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
                      >
                        {task.project.name ?? 'View project'}
                      </Link>
                    ) : (
                      <span className="text-slate-400/80">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{task.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-200">{task.priority ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-200">{formatDate(task.dueDate ?? null)}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {task.updatedAt ? formatDateTime(task.updatedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const columnTasks = tasksByStatus.get(status) ?? [];
            return (
              <div
                key={status}
                className="flex min-h-[16rem] flex-col rounded-xl border border-white/10 bg-slate-950/70"
              >
                <header className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                    {status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {columnTasks.length}
                  </span>
                </header>
                <div className="flex-1 space-y-3 p-3">
                  {columnTasks.length === 0 ? (
                    <p className="text-xs text-slate-500/80">No tasks in this column yet.</p>
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        key={task.id}
                        className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 shadow-sm shadow-sky-900/20 transition hover:border-sky-400/30 hover:bg-slate-900/70"
                      >
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-sm font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline"
                        >
                          {task.title}
                        </Link>
                        {task.project?.id ? (
                          <Link
                            href={`/projects/${task.project.id}`}
                            className="block text-xs text-slate-400 underline-offset-4 transition hover:text-sky-200 hover:underline"
                          >
                            {task.project.name ?? 'View project'}
                          </Link>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                            Priority: {task.priority ?? '—'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                            Due: {formatDate(task.dueDate ?? null)}
                          </span>
                        </div>
                        {task.description ? (
                          <p className="line-clamp-3 text-xs text-slate-400/80">{task.description}</p>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

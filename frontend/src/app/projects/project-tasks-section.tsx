"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DeleteTaskButton } from './delete-task-button';
import { NewTaskButton } from './new-task-button';
import type { ProjectDetail, ProjectMember } from './types';
import {
  PROJECT_TASK_SORT_FIELDS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from './types';
import { formatDate } from './project-utils';

interface ProjectTasksSectionProps {
  projectId: string;
  tasks: ProjectDetail['tasks'];
  members: ProjectMember[];
  canManageTasks: boolean;
}

const SORT_LABELS: Record<
  (typeof PROJECT_TASK_SORT_FIELDS)[number],
  string
> = {
  createdAt: 'created',
  updatedAt: 'updated',
  dueDate: 'due date',
  priority: 'priority',
  status: 'status',
  title: 'title',
};

export function ProjectTasksSection({
  projectId,
  tasks,
  members,
  canManageTasks,
}: ProjectTasksSectionProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState<(typeof PROJECT_TASK_SORT_FIELDS)[number]>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'kanban'>('table');

  const filteredTasks = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const statusFilter = status.trim().toUpperCase();
    const priorityFilter = priority.trim().toUpperCase();

    const filtered = tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter && (task.priority ?? '').toUpperCase() !== priorityFilter) {
        return false;
      }
      if (searchTerm) {
        const haystack = [
          task.title,
          task.description ?? '',
          task.assignee?.username ?? '',
          task.assignee?.firstName ?? '',
          task.assignee?.lastName ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }
      return true;
    });

    const direction = sortOrder === 'asc' ? 1 : -1;

    const compare = (a: ProjectDetail['tasks'][number], b: ProjectDetail['tasks'][number]) => {
      switch (sortBy) {
        case 'createdAt': {
          return compareDates(a.createdAt, b.createdAt);
        }
        case 'updatedAt': {
          return compareDates(a.updatedAt, b.updatedAt);
        }
        case 'dueDate': {
          return compareDates(a.dueDate ?? null, b.dueDate ?? null);
        }
        case 'priority': {
          return compareStringNullable(a.priority, b.priority);
        }
        case 'status': {
          return compareStringNullable(a.status, b.status);
        }
        case 'title': {
          return compareStringNullable(a.title, b.title);
        }
        default:
          return 0;
      }
    };

    function compareDates(a: string | Date | null | undefined, b: string | Date | null | undefined) {
      const aDate = a ? new Date(a).getTime() : null;
      const bDate = b ? new Date(b).getTime() : null;
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return -1 * direction;
      if (bDate === null) return 1 * direction;
      if (aDate === bDate) return 0;
      return aDate > bDate ? direction : -direction;
    }

    function compareStringNullable(a: string | null | undefined, b: string | null | undefined) {
      const aVal = (a ?? '').toLowerCase();
      const bVal = (b ?? '').toLowerCase();
      if (aVal === bVal) return 0;
      return aVal > bVal ? direction : -direction;
    }

    return filtered.sort(compare);
  }, [tasks, search, status, priority, sortBy, sortOrder]);

  const priorityRank = useMemo(() => {
    const rank = new Map<string, number>();
    TASK_PRIORITIES.forEach((priority, index) => {
      rank.set(priority, index);
    });
    return rank;
  }, []);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, ProjectDetail['tasks']>();
    for (const status of TASK_STATUSES) {
      map.set(status, []);
    }
    for (const task of filteredTasks) {
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
        if (aDue !== bDue) return aDue - bDue;
        const aRank = priorityRank.get((a.priority ?? 'MEDIUM').toUpperCase()) ?? Number.MAX_SAFE_INTEGER;
        const bRank = priorityRank.get((b.priority ?? 'MEDIUM').toUpperCase()) ?? Number.MAX_SAFE_INTEGER;
        if (aRank !== bRank) return aRank - bRank;
        return a.title.localeCompare(b.title);
      });
    }
    return map;
  }, [filteredTasks, priorityRank]);

  const hasTasks = tasks.length > 0;

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <p className="text-xs text-slate-400">
            Showing {filteredTasks.length} of {tasks.length} task{tasks.length === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 text-xs font-semibold text-slate-200">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-md px-3 py-1 ${view === 'table' ? 'bg-sky-500/30 text-white shadow shadow-sky-500/30' : 'hover:bg-white/10 hover:text-white'}`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`rounded-md px-3 py-1 ${view === 'kanban' ? 'bg-sky-500/30 text-white shadow shadow-sky-500/30' : 'hover:bg-white/10 hover:text-white'}`}
            >
              Kanban
            </button>
          </div>
          {canManageTasks ? (
            <NewTaskButton projectId={projectId} members={members} />
          ) : null}
        </div>
      </header>

      {hasTasks ? (
        <div className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Search</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find tasks"
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            />
          </label>

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">All</option>
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="">All</option>
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 text-sm text-slate-200 md:grid-cols-[2fr,1fr]">
            <label>
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as (typeof PROJECT_TASK_SORT_FIELDS)[number])
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
              >
                {PROJECT_TASK_SORT_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {SORT_LABELS[field]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Order</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {hasTasks ? (
        filteredTasks.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300/80">
            No tasks match the selected filters.
          </p>
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300/80">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    Title
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
                    Assignee
                  </th>
                  {canManageTasks ? (
                    <th scope="col" className="px-4 py-3 text-right">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-sky-300 underline-offset-4 transition hover:text-white hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{task.status}</td>
                    <td className="px-4 py-3 text-slate-200">{task.priority ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-200">{formatDate(task.dueDate ?? null)}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {task.assignee
                        ? [task.assignee.firstName, task.assignee.lastName]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || task.assignee.username || 'Unassigned'
                        : 'Unassigned'}
                    </td>
                    {canManageTasks ? (
                      <td className="px-4 py-3 text-right">
                        <DeleteTaskButton taskId={task.id} />
                      </td>
                    ) : null}
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
                          {canManageTasks ? (
                            <div className="flex justify-end">
                              <DeleteTaskButton taskId={task.id} />
                            </div>
                          ) : null}
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300/80">
          No tasks are currently associated with this project.
        </p>
      )}
    </section>
  );
}

import Link from 'next/link';
import { formatDate, formatDateTime } from '../projects/project-utils';
import { fetchCurrentUser } from '../projects/project-fetchers';
import { fetchMyTasks } from './task-fetchers';
import { TASK_PRIORITIES, TASK_STATUSES } from '../projects/types';

const SORT_FIELDS = ['dueDate', 'updatedAt', 'createdAt', 'priority', 'status'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

type SortField = (typeof SORT_FIELDS)[number];
type SortOrder = (typeof SORT_ORDERS)[number];

function normaliseSearchParam(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value[0] ?? '' : value;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : {};

  const rawSearch = normaliseSearchParam(params.search);
  const rawStatus = normaliseSearchParam(params.status);
  const rawPriority = normaliseSearchParam(params.priority);
  const rawSortBy = normaliseSearchParam(params.sortBy);
  const rawSortOrder = normaliseSearchParam(params.sortOrder);

  const status =
    rawStatus && TASK_STATUSES.includes(rawStatus.toUpperCase() as (typeof TASK_STATUSES)[number])
      ? rawStatus.toUpperCase()
      : '';

  const priority =
    rawPriority &&
    TASK_PRIORITIES.includes(rawPriority.toUpperCase() as (typeof TASK_PRIORITIES)[number])
      ? rawPriority.toUpperCase()
      : '';

  const sortBy = SORT_FIELDS.includes(rawSortBy as SortField) ? (rawSortBy as SortField) : 'updatedAt';
  const sortOrder = SORT_ORDERS.includes(rawSortOrder.toLowerCase() as SortOrder)
    ? (rawSortOrder.toLowerCase() as SortOrder)
    : 'desc';

  const [currentUser, tasks] = await Promise.all([
    fetchCurrentUser(),
    fetchMyTasks({
      search: rawSearch ? rawSearch : undefined,
      status: status || undefined,
      priority: priority || undefined,
      sortBy,
      sortOrder,
    }),
  ]);
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() ||
    currentUser?.username ||
    currentUser?.email ||
    'your assignments';

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Tasks</h1>
          <p className="text-sm text-slate-300/80">
            Tasks currently assigned to {displayName}.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-slate-950/60 p-4 shadow shadow-sky-900/30">
        <form className="grid gap-4 md:grid-cols-4" action="/tasks" method="get">
          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Search</span>
            <input
              name="search"
              type="search"
              defaultValue={rawSearch}
              placeholder="Find tasks"
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
            />
          </label>

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
            <select
              name="status"
              defaultValue={status}
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
              name="priority"
              defaultValue={priority}
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

          <label className="text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Sort by</span>
            <div className="mt-1 grid grid-cols-[2fr,1fr] gap-2">
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
              >
                {SORT_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </option>
                ))}
              </select>
              <select
                name="sortOrder"
                defaultValue={sortOrder}
                className="rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </label>

          <div className="md:col-span-4 flex items-center justify-end gap-3">
            {(rawSearch || status || priority || sortBy !== 'updatedAt' || sortOrder !== 'desc') ? (
              <Link
                href="/tasks"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
              >
                Reset
              </Link>
            ) : null}
            <button
              type="submit"
              className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            >
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 shadow-lg shadow-sky-500/10">
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-300/70">
                  No tasks assigned to you yet.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
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
                  <td className="px-4 py-3 text-slate-200">
                    {task.status.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{task.priority ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-200">{formatDate(task.dueDate ?? null)}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {task.updatedAt ? formatDateTime(task.updatedAt) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

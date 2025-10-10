import Link from 'next/link';
import { formatDate, formatDateTime } from '../projects/project-utils';
import { fetchCurrentUser } from '../projects/project-fetchers';
import { LogoutButton } from '../projects/logout-button';
import { fetchMyTasks } from './task-fetchers';

export default async function TasksPage() {
  const [currentUser, tasks] = await Promise.all([fetchCurrentUser(), fetchMyTasks()]);
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() ||
    currentUser?.username ||
    currentUser?.email ||
    'your assignments';

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Tasks</h1>
          <p className="text-sm text-slate-300/80">
            Tasks currently assigned to {displayName}.
          </p>
        </div>
        <LogoutButton />
      </header>

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

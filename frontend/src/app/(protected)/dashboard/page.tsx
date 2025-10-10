import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderKanban,
  Sparkles,
  Users,
} from 'lucide-react';
import { fetchFromBff } from '@/lib/server/bff-fetch';
import type { UserProjectMembership, UserTask } from '@/types/api';

function formatStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function loadUserProjects(): Promise<UserProjectMembership[]> {
  const { data, ok } = await fetchFromBff<UserProjectMembership[]>(
    '/api/users/me/projects',
  );
  if (!ok || !data) {
    return [];
  }
  return data;
}

async function loadUserTasks(): Promise<UserTask[]> {
  const { data, ok } = await fetchFromBff<UserTask[]>('/api/users/me/tasks');
  if (!ok || !data) {
    return [];
  }
  return data;
}

function deriveActivityIcon(task: UserTask) {
  switch (task.status.toUpperCase()) {
    case 'DONE':
      return CheckCircle2;
    case 'IN_PROGRESS':
    case 'IN_REVIEW':
      return Activity;
    default:
      return Clock;
  }
}

export default async function DashboardPage() {
  const [projects, tasks] = await Promise.all([
    loadUserProjects(),
    loadUserTasks(),
  ]);

  const activeProjects = projects.filter(
    (membership) => membership.project.status !== 'ARCHIVED',
  );
  const inProgressTasks = tasks.filter((task) =>
    ['IN_PROGRESS', 'IN_REVIEW'].includes(task.status.toUpperCase()),
  );
  const completedTasks = tasks.filter(
    (task) => task.status.toUpperCase() === 'DONE',
  );
  const backlogTasks = tasks.filter(
    (task) => task.status.toUpperCase() === 'TODO',
  );

  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const metrics = [
    {
      label: 'Active Projects',
      value: activeProjects.length.toString(),
      change: totalProjects
        ? `${Math.round((activeProjects.length / totalProjects) * 100)}% engaged`
        : '—',
      icon: FolderKanban,
      accent: 'from-sky-500/20 to-sky-500/0',
    },
    {
      label: 'Tasks In Motion',
      value: inProgressTasks.length.toString(),
      change: totalTasks
        ? `${Math.round((inProgressTasks.length / totalTasks) * 100)}% of workload`
        : '—',
      icon: CheckSquare,
      accent: 'from-emerald-500/20 to-emerald-500/0',
    },
    {
      label: 'Completed Tasks',
      value: completedTasks.length.toString(),
      change: totalTasks
        ? `${Math.round((completedTasks.length / totalTasks) * 100)}% delivered`
        : '—',
      icon: CheckCircle2,
      accent: 'from-indigo-500/20 to-indigo-500/0',
    },
    {
      label: 'Backlog Items',
      value: backlogTasks.length.toString(),
      change: totalTasks
        ? `${Math.round((backlogTasks.length / totalTasks) * 100)}% queued`
        : '—',
      icon: Users,
      accent: 'from-amber-500/20 to-amber-500/0',
    },
  ];

  const topProjects = projects.slice(0, 3);
  const recentActivity = tasks
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 shadow-2xl shadow-sky-500/10 backdrop-blur-lg sm:p-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">
              <Sparkles className="h-4 w-4" />
              Live Status
            </span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Operational health is{' '}
              <span className="text-sky-200">
                {activeProjects.length ? 'engaged' : 'warming up'}
              </span>{' '}
              with {inProgressTasks.length} items in motion.
            </h2>
            <p className="text-sm text-slate-200/80">
              Monitor throughput, unblock delivery, and orchestrate the next steps with a command center
              built for high-performing operations teams.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm shadow-xl shadow-indigo-500/20">
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-xs uppercase tracking-[0.2em]">
                Delivery Health
              </span>
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="text-3xl font-semibold text-white">
              {totalTasks
                ? `${Math.round((completedTasks.length / totalTasks) * 100)}%`
                : '—'}
            </div>
            <div className="w-full rounded-full bg-white/10">
              <div
                className="h-[6px] rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                style={{
                  width: totalTasks
                    ? `${Math.round((completedTasks.length / totalTasks) * 100)}%`
                    : '0%',
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {completedTasks.length} of {totalTasks} tasks delivered across your current portfolio.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-sky-500/10 transition hover:border-white/30 hover:shadow-sky-500/30"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-0 transition group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <ArrowUpRight className="h-3 w-3" />
                    {metric.change}
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-indigo-500/20 backdrop-blur-xl xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Active flight plans</h3>
              <p className="text-sm text-slate-300/80">
                Projects sequencing in the next delivery window.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/40 hover:text-white">
              View roadmap
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {topProjects.length ? (
              topProjects.map((membership) => (
                <div
                  key={membership.projectId}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-sky-500/5 transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {membership.project.name}
                      </p>
                      {membership.project.description ? (
                        <p className="text-xs text-slate-300/70">
                          {membership.project.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
                      <Sparkles className="h-3 w-3" />
                      {formatStatus(membership.project.status)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 text-xs text-slate-300/80 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-slate-100">Role</span>
                      <p className="mt-1 text-sm text-white">
                        {formatStatus(membership.role)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-slate-100">Tasks</span>
                      <p className="mt-1 text-sm text-white">
                        {membership.project._count?.tasks ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-slate-100">Joined</span>
                      <p className="mt-1 text-sm text-white">
                        {formatDate(membership.joinedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300/80">
                No project memberships yet. Join an initiative to see it here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-sky-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Ops activity</h3>
            <button className="text-xs font-semibold text-sky-200 transition hover:text-white">
              View all
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {recentActivity.length ? (
              recentActivity.map((task) => {
                const Icon = deriveActivityIcon(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-white">{task.title}</p>
                        <span className="text-xs text-slate-400">
                          {formatDate(task.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/80">
                        {task.project?.name ?? 'Unassigned project'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300/80">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

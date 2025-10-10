import { ArrowUpRight, Sparkles, Users } from 'lucide-react';
import { fetchFromBff } from '@/lib/server/bff-fetch';
import type { PaginatedProjectResponse, ProjectEntity } from '@/types/api';

const statusToneMap: Record<string, string> = {
  ACTIVE: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
  INACTIVE: 'text-slate-200 bg-slate-500/10 border-slate-500/30',
  ARCHIVED: 'text-slate-200 bg-slate-500/10 border-slate-500/30',
  COMPLETED: 'text-indigo-200 bg-indigo-500/10 border-indigo-500/30',
};

function getStatusTone(status: string) {
  return (
    statusToneMap[status.toUpperCase()] ??
    'text-sky-200 bg-sky-500/10 border-sky-500/30'
  );
}

function formatStatusLabel(status: string) {
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

async function loadProjects(): Promise<ProjectEntity[]> {
  const { data, ok } = await fetchFromBff<
    PaginatedProjectResponse | { statusCode?: number }
  >('/api/projects');

  if (!ok || !data || typeof data !== 'object' || !('data' in data)) {
    return [];
  }

  const payload = data as PaginatedProjectResponse;
  return Array.isArray(payload.data) ? payload.data : [];
}

export default async function ProjectsPage() {
  const projects = await loadProjects();

  return (
    <div className="space-y-12">
      <header className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-slate-200 shadow-2xl shadow-indigo-500/15 backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              Flight Plans
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                High-impact work, visualised.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300/80">
                Orchestrate delivery with a clear view of priorities, capacity, and next milestones. Track
                progress with live signals and keep teams in sync.
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.01]">
            New initiative
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300/80">
            No projects found. Create a new initiative to get started.
          </div>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-200 shadow-lg shadow-sky-500/10 transition hover:border-white/25 hover:shadow-sky-500/30"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                    {project.description ? (
                      <p className="text-sm text-slate-300/80">{project.description}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${getStatusTone(project.status)}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {formatStatusLabel(project.status)}
                  </span>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-inner shadow-indigo-500/10">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                    <span>Project snapshot</span>
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="grid gap-3 text-xs text-slate-300/80 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="flex items-center gap-2 text-slate-100">
                        <Users className="h-4 w-4 text-slate-200/80" />
                        Team
                      </span>
                      <p className="mt-1 text-sm text-white">
                        {project.members.slice(0, 3).map((member) => member.user.firstName ?? member.user.username).join(', ') ||
                          'Unassigned'}
                        {project.members.length > 3 ? '…' : ''}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-slate-100">Tasks</span>
                      <p className="mt-1 text-sm text-white">
                        {project._count?.tasks ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-slate-100">Members</span>
                      <p className="mt-1 text-sm text-white">
                        {project._count?.members ?? project.members.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Forecast aligned with capacity plan.</span>
                  <button className="inline-flex items-center gap-1 text-sky-200 transition hover:text-white">
                    Details
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

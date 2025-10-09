import {
  ArrowUpRight,
  CalendarClock,
  KanbanSquare,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';

const projects = [
  {
    name: 'Cosmic Commerce Revamp',
    description: 'Recalibrating the buyer journey for omni-channel harmony.',
    status: 'In flight',
    statusTone: 'text-sky-200 bg-sky-500/10 border-sky-500/30',
    due: 'Dec 18, 2024',
    progress: 78,
    team: 'Team Aurora',
    priority: 'High',
  },
  {
    name: 'Mobile Field Operations',
    description: 'Offline-first experience for dispatch and site surveys.',
    status: 'Planning sprint 02',
    statusTone: 'text-amber-200 bg-amber-500/10 border-amber-500/40',
    due: 'Jan 08, 2025',
    progress: 42,
    team: 'Velocity Squad',
    priority: 'Medium',
  },
  {
    name: 'API Federation',
    description: 'Shared authentication with partner ecosystems and services.',
    status: 'QA validation',
    statusTone: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
    due: 'Nov 20, 2024',
    progress: 64,
    team: 'Edge Services',
    priority: 'High',
  },
  {
    name: 'Insights Command Center',
    description: 'Realtime analytics and decision workspace for exec reviews.',
    status: 'Discovery',
    statusTone: 'text-purple-200 bg-purple-500/10 border-purple-500/30',
    due: 'Feb 12, 2025',
    progress: 18,
    team: 'Northstar Guild',
    priority: 'Low',
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-12">
      <header className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-slate-200 shadow-2xl shadow-indigo-500/15 backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              <KanbanSquare className="h-3.5 w-3.5" />
              Flight Plans
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                High-impact work, visualised.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300/80">
                Orchestrate delivery with a clear view of priorities, capacity, and next milestones. Track progress with live signals and keep teams in sync.
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
        {projects.map((project) => (
          <article
            key={project.name}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-200 shadow-lg shadow-sky-500/10 transition hover:border-white/25 hover:shadow-sky-500/30"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                  <p className="text-sm text-slate-300/80">{project.description}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${project.statusTone}`}
                >
                  <Sparkles className="h-3 w-3" />
                  {project.status}
                </span>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-inner shadow-indigo-500/10">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                  <span>Trajectory</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300/80 sm:text-sm">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/90">
                    <Users className="h-4 w-4" />
                    {project.team}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/90">
                    <Layers className="h-4 w-4" />
                    Priority: {project.priority}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/90">
                    <CalendarClock className="h-4 w-4" />
                    Next gate: {project.due}
                  </span>
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
        ))}
      </section>
    </div>
  );
}

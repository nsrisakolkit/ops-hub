import {
  AlarmClock,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Timer,
} from 'lucide-react';

const tasks = [
  {
    title: 'Refresh UI component system',
    project: 'Cosmic Commerce',
    priority: 'High',
    due: 'Due today',
    status: 'inprogress',
    statusLabel: 'In motion',
    accent: 'from-sky-400 via-indigo-500 to-purple-500',
  },
  {
    title: 'Implement secure auth handoff',
    project: 'Mobile Field Ops',
    priority: 'Medium',
    due: 'Dec 10',
    status: 'todo',
    statusLabel: 'Next up',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    title: 'Harden CI/CD pipeline',
    project: 'Platform Engineering',
    priority: 'Completed',
    due: 'Dec 02',
    status: 'done',
    statusLabel: 'Delivered',
    accent: 'from-emerald-400 via-teal-500 to-sky-500',
  },
  {
    title: 'Author integration playbook',
    project: 'API Federation',
    priority: 'Medium',
    due: 'Dec 15',
    status: 'todo',
    statusLabel: 'Backlog',
    accent: 'from-purple-400 via-indigo-500 to-slate-500',
  },
];

const statusIcon = {
  todo: Circle,
  inprogress: Loader2,
  done: CheckCircle2,
};

export default function TasksPage() {
  return (
    <div className="space-y-12">
      <header className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-slate-200 shadow-2xl shadow-emerald-500/10 backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              <Timer className="h-3.5 w-3.5" />
              Mission Control
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Align execution with laser focus.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300/80">
                Move work through your pipeline with clarity. Visualise what’s delivered, what’s active, and what needs attention before the next checkpoint.
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.01]">
            Plan new sprint
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-emerald-500/15 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Flow lane overview</h2>
            <p className="text-sm text-slate-300/80">Live assignments for the current sprint window.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white">
            Export summary
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {tasks.map((task) => {
            const Icon = statusIcon[task.status as keyof typeof statusIcon];
            return (
              <article
                key={task.title}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-slate-200 shadow-inner shadow-sky-500/5 transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
                      <span className={`absolute inset-0 bg-gradient-to-br ${task.accent} opacity-80`} />
                      <Icon
                        className={
                          task.status === 'inprogress'
                            ? 'relative h-5 w-5 animate-spin text-white'
                            : 'relative h-5 w-5 text-white'
                        }
                      />
                    </span>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{task.title}</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                          <Sparkles className="h-3 w-3" />
                          {task.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300/70">
                        {task.project} • Priority {task.priority}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300/70">
                    <AlarmClock className="h-4 w-4 text-slate-200/70" />
                    {task.due}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

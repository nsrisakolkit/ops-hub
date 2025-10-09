import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckSquare,
  Clock,
  FolderKanban,
  Percent,
  Sparkles,
  Users,
} from 'lucide-react';

const metricCards = [
  {
    label: 'Active Projects',
    value: '12',
    change: '+18.2%',
    icon: FolderKanban,
    accent: 'from-sky-500/20 to-sky-500/0',
  },
  {
    label: 'Tasks In Motion',
    value: '24',
    change: '+6.4%',
    icon: CheckSquare,
    accent: 'from-emerald-500/20 to-emerald-500/0',
  },
  {
    label: 'Team Velocity',
    value: '92%',
    change: '+4.1%',
    icon: Users,
    accent: 'from-indigo-500/20 to-indigo-500/0',
  },
  {
    label: 'On-time Delivery',
    value: '98%',
    change: '+2.6%',
    icon: Percent,
    accent: 'from-amber-500/20 to-amber-500/0',
  },
];

const activeProjects = [
  {
    name: 'Cosmic Commerce Revamp',
    category: 'Customer Experience',
    status: 'In flight',
    progress: 78,
    owner: 'Team Aurora',
  },
  {
    name: 'Mobile Field Operations',
    category: 'Platform',
    status: 'Planning',
    progress: 42,
    owner: 'Velocity Squad',
  },
  {
    name: 'API Federation',
    category: 'Integrations',
    status: 'QA Ready',
    progress: 64,
    owner: 'Edge Services',
  },
];

const activityFeed = [
  {
    icon: Activity,
    title: 'Incident response playbook updated',
    timestamp: '12m ago',
    meta: 'Automation Suite',
  },
  {
    icon: Clock,
    title: 'Ops review scheduled for Tuesday',
    timestamp: '58m ago',
    meta: 'Leadership Sync',
  },
  {
    icon: BarChart3,
    title: 'KPI baseline recalculated',
    timestamp: '2h ago',
    meta: 'Analytics Engine',
  },
];

export default function DashboardPage() {
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
              Operational health is <span className="text-sky-200">stable</span> and trending up.
            </h2>
            <p className="text-sm text-slate-200/80">
              Monitor throughput, unblock delivery, and orchestrate the next steps with a command center built for high-performing operations teams.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm shadow-xl shadow-indigo-500/20">
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-xs uppercase tracking-[0.2em]">Flow Efficiency</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="text-3xl font-semibold text-white">94%</div>
            <div className="w-full rounded-full bg-white/10">
              <div className="h-[6px] rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400" style={{ width: '94%' }} />
            </div>
            <p className="text-xs text-slate-400">
              Up 4.6% in the last sprint. Capacity is aligned and bottlenecks are being resolved 2x faster.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-sky-500/10 transition hover:border-white/30 hover:shadow-sky-500/30`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-0 transition group-hover:opacity-100`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
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
              <p className="text-sm text-slate-300/80">Projects sequencing in the next 4 weeks</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/40 hover:text-white">
              View roadmap
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {activeProjects.map((project) => (
              <div
                key={project.name}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-sky-500/5 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{project.name}</p>
                    <p className="text-xs text-slate-300/70">{project.category}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100">
                    <Sparkles className="h-3 w-3" />
                    {project.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full rounded-full bg-white/10 sm:w-2/3">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300/80">
                    {project.progress}% complete • Owned by {project.owner}
                  </p>
                </div>
              </div>
            ))}
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
            {activityFeed.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-indigo-500/10"
                >
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white/80">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-300/70">{item.meta}</p>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

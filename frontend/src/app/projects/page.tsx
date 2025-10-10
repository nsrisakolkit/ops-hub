import Link from 'next/link';
import { formatDate } from './project-utils';
import { LogoutButton } from './logout-button';
import { NewProjectButton } from './new-project-button';
import { fetchCurrentUser, fetchProjectsForRole } from './project-fetchers';

export default async function ProjectsPage() {
  const currentUser = await fetchCurrentUser();
  const role = currentUser?.role;

  const projects = await fetchProjectsForRole(role);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-slate-300/80">
            Overview of active initiatives sourced from the backend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewProjectButton />
          <LogoutButton />
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 shadow-lg shadow-sky-500/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300/80">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-300/70">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-2 text-sky-300 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="max-w-[28ch] px-4 py-3 text-slate-300/80">
                    {project.description ? (
                      <span className="block truncate" title={project.description}>
                        {project.description}
                      </span>
                    ) : (
                      <span className="text-slate-500/70">No description</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{project.status}</td>
                  <td className="px-4 py-3 text-slate-300/70">{formatDate(project.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

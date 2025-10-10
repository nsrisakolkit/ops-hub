import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Project, ResponseEnvelope, MeResponse } from './types';
import { normaliseProjects } from './project-utils';
import { LogoutButton } from './logout-button';
import { NewProjectButton } from './new-project-button';

function formatDate(value: string) {
  if (!value) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value || '—';
  }
}

async function fetchWithCookies(path: string): Promise<Response> {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const host =
    headersList.get('x-forwarded-host') ?? headersList.get('host') ?? '127.0.0.1:3000';
  const protocol =
    headersList.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;

  return fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });
}

async function fetchCurrentUser(): Promise<MeResponse | null> {
  const response = await fetchWithCookies('/api/users/me');

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  const envelope = (payload ?? {}) as ResponseEnvelope<MeResponse>;
  const fallbackUser =
    payload && typeof payload === 'object'
      ? ((payload as Record<string, unknown>).user as MeResponse | undefined)
      : undefined;
  const data = envelope.data ?? fallbackUser;
  return data ?? null;
}

async function fetchProjects(role?: string): Promise<Project[]> {
  const path = role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/api/projects' : '/api/users/me/projects';

  const response = await fetchWithCookies(path);

  if (response.status === 401) {
    redirect('/login');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
    const errorMessage =
      typeof envelope.error === 'string'
        ? envelope.error
        : typeof envelope.message === 'string'
          ? envelope.message
          : 'Unable to load projects from backend.';

    throw new Error(errorMessage);
  }

  return normaliseProjects(payload);
}

export default async function ProjectsPage() {
  const currentUser = await fetchCurrentUser();
  const role = currentUser?.role;

  const projects = await fetchProjects(role);

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
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Name
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
                  <td className="px-4 py-3 font-mono text-xs text-slate-300/70">{project.id}</td>
                  <td className="px-4 py-3 text-white">{project.name}</td>
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

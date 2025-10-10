import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from './logout-button';

interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface ResponseEnvelope<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

interface MeResponse {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

function toProject(candidate: unknown): Project | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Record<string, unknown>;

  if (typeof record.id === 'string' && typeof record.name === 'string') {
    return {
      id: record.id,
      name: record.name,
      status: typeof record.status === 'string' ? record.status : 'UNKNOWN',
      createdAt: typeof record.createdAt === 'string'
        ? record.createdAt
        : typeof record.createdAt === 'number'
          ? new Date(record.createdAt).toISOString()
          : '',
    } satisfies Project;
  }

  if (record.project && typeof record.project === 'object') {
    const project = record.project as Record<string, unknown>;
    if (typeof project.id === 'string' && typeof project.name === 'string') {
      return {
        id: project.id,
        name: project.name,
        status: typeof project.status === 'string' ? project.status : 'UNKNOWN',
        createdAt: typeof project.createdAt === 'string'
          ? project.createdAt
          : typeof project.createdAt === 'number'
            ? new Date(project.createdAt).toISOString()
            : '',
      } satisfies Project;
    }
  }

  return null;
}

function normaliseProjects(payload: unknown): Project[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const container = payload as Record<string, unknown>;

  const extractArray = (): unknown[] => {
    if (Array.isArray(container)) {
      return container as unknown[];
    }

    if (Array.isArray(container.data)) {
      return container.data as unknown[];
    }

    const nested = container.data;
    if (
      nested &&
      typeof nested === 'object' &&
      Array.isArray((nested as Record<string, unknown>).data)
    ) {
      return (nested as Record<string, unknown>).data as unknown[];
    }

    return [];
  };

  return extractArray()
    .map((entry) => toProject(entry))
    .filter((project): project is Project => Boolean(project));
}

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
  const data = envelope.data ?? (payload?.user as MeResponse | undefined);
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
    const envelope = (payload ?? {}) as ResponseEnvelope<unknown> & {
      error?: unknown;
    };
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
          <button
            type="button"
            disabled
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 opacity-60"
          >
            New Project (coming soon)
          </button>
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

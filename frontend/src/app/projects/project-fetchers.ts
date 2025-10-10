import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { extractProjectDetail, extractTaskDetail, normaliseProjects } from './project-utils';
import type {
  MeResponse,
  Project,
  ProjectDetail,
  ResponseEnvelope,
  TaskDetail,
} from './types';

export async function fetchWithCookies(path: string): Promise<Response> {
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

export async function fetchCurrentUser(): Promise<MeResponse | null> {
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

export async function fetchProjectsForRole(role?: string): Promise<Project[]> {
  const path =
    role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? '/api/projects'
      : '/api/users/me/projects';

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

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const response = await fetchWithCookies(`/api/projects/${projectId}`);

  if (response.status === 401) {
    redirect('/login');
  }

  if (response.status === 404) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
    const message =
      typeof envelope.error === 'string'
        ? envelope.error
        : typeof envelope.message === 'string'
          ? envelope.message
          : 'Unable to load project details.';
    throw new Error(message);
  }

  return extractProjectDetail(payload);
}

export async function fetchTaskDetail(taskId: string): Promise<TaskDetail | null> {
  const response = await fetchWithCookies(`/api/tasks/${taskId}`);

  if (response.status === 401) {
    redirect('/login');
  }

  if (response.status === 404) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
    const message =
      typeof envelope.error === 'string'
        ? envelope.error
        : typeof envelope.message === 'string'
          ? envelope.message
          : 'Unable to load task details.';
    throw new Error(message);
  }

  return extractTaskDetail(payload);
}

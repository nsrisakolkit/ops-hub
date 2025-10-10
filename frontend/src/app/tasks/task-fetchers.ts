import { redirect } from 'next/navigation';
import { fetchWithCookies } from '../projects/project-fetchers';
import { normaliseTasks } from '../projects/project-utils';
import type { ProjectTask, ResponseEnvelope } from '../projects/types';

export async function fetchMyTasks(): Promise<ProjectTask[]> {
  const response = await fetchWithCookies('/api/tasks/my');

  if (response.status === 401) {
    redirect('/login');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
    const message =
      typeof envelope.error === 'string'
        ? envelope.error
        : typeof envelope.message === 'string'
          ? envelope.message
          : 'Unable to load tasks.';
    throw new Error(message);
  }

  return normaliseTasks(payload);
}

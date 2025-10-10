import { redirect } from 'next/navigation';
import { fetchWithCookies } from '../projects/project-fetchers';
import { normaliseTasks } from '../projects/project-utils';
import type { ProjectTask, ResponseEnvelope } from '../projects/types';

export interface MyTaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchMyTasks(filters?: MyTaskFilters): Promise<ProjectTask[]> {
  const query = new URLSearchParams();

  if (filters) {
    const { search, status, priority, sortBy, sortOrder } = filters;
    if (search) query.set('search', search);
    if (status) query.set('status', status.toUpperCase());
    if (priority) query.set('priority', priority.toUpperCase());
    if (sortBy) query.set('sortBy', sortBy);
    if (sortOrder) query.set('sortOrder', sortOrder.toUpperCase());
  }

  const queryString = query.toString();
  const response = await fetchWithCookies(`/api/tasks/my${queryString ? `?${queryString}` : ''}`);

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

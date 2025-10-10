import type { Project } from './types';

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
      createdAt:
        typeof record.createdAt === 'string'
          ? record.createdAt
          : typeof record.createdAt === 'number'
            ? new Date(record.createdAt).toISOString()
            : '',
    };
  }

  if (record.project && typeof record.project === 'object') {
    return toProject(record.project);
  }

  return null;
}

function extractArray(container: unknown): unknown[] {
  if (Array.isArray(container)) {
    return container;
  }

  if (container && typeof container === 'object') {
    const record = container as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as unknown[];
    }

    if (record.data && typeof record.data === 'object') {
      return extractArray(record.data);
    }
  }

  return [];
}

export function normaliseProjects(payload: unknown): Project[] {
  return extractArray(payload)
    .map((entry) => toProject(entry))
    .filter((project): project is Project => Boolean(project));
}

export function extractProject(payload: unknown): Project | null {
  const direct = toProject(payload);
  if (direct) {
    return direct;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.data) {
    const fromData = extractProject(record.data);
    if (fromData) {
      return fromData;
    }
  }

  if (Array.isArray(record.data)) {
    for (const entry of record.data as unknown[]) {
      const project = toProject(entry);
      if (project) {
        return project;
      }
    }
  }

  return null;
}

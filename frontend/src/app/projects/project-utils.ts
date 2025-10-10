import type { Project, ProjectDetail, ProjectMember, ProjectRole, ProjectTask } from './types';
import { PROJECT_ROLES } from './types';

function normaliseRole(value: unknown): ProjectRole {
  if (typeof value === 'string') {
    const role = value.toUpperCase() as ProjectRole;
    if (PROJECT_ROLES.includes(role)) {
      return role;
    }
  }

  return 'MEMBER';
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
      createdAt:
        typeof record.createdAt === 'string'
          ? record.createdAt
          : typeof record.createdAt === 'number'
            ? new Date(record.createdAt).toISOString()
            : '',
      updatedAt:
        typeof record.updatedAt === 'string'
          ? record.updatedAt
          : typeof record.updatedAt === 'number'
            ? new Date(record.updatedAt).toISOString()
            : '',
      description:
        typeof record.description === 'string'
          ? record.description
          : record.description === null
            ? null
            : undefined,
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

function toMember(candidate: unknown): ProjectMember | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  if (typeof record.id !== 'string') {
    return null;
  }

  const user = record.user && typeof record.user === 'object'
    ? (record.user as Record<string, unknown>)
    : {};

  return {
    id: record.id,
    role: normaliseRole(record.role),
    joinedAt:
      typeof record.joinedAt === 'string'
        ? record.joinedAt
        : typeof record.joinedAt === 'number'
          ? new Date(record.joinedAt).toISOString()
          : '',
    userId: typeof record.userId === 'string' ? record.userId : '',
    user: {
      id: typeof user.id === 'string' ? user.id : '',
      username: typeof user.username === 'string' ? user.username : undefined,
      firstName:
        typeof user.firstName === 'string' || user.firstName === null
          ? (user.firstName as string | null)
          : undefined,
      lastName:
        typeof user.lastName === 'string' || user.lastName === null
          ? (user.lastName as string | null)
          : undefined,
      email: typeof user.email === 'string' ? user.email : undefined,
    },
  };
}

function toTask(candidate: unknown): ProjectTask | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  if (typeof record.id !== 'string') {
    return null;
  }

  const assignee = record.assignee && typeof record.assignee === 'object'
    ? (record.assignee as Record<string, unknown>)
    : null;

  return {
    id: record.id,
    title: typeof record.title === 'string' ? record.title : '',
    status: typeof record.status === 'string' ? record.status : 'UNKNOWN',
    priority: typeof record.priority === 'string' ? record.priority : undefined,
    dueDate:
      typeof record.dueDate === 'string'
        ? record.dueDate
        : record.dueDate === null
          ? null
          : undefined,
    assignee: assignee
      ? {
          id: typeof assignee.id === 'string' ? assignee.id : '',
          username:
            typeof assignee.username === 'string' ? assignee.username : undefined,
          firstName:
            typeof assignee.firstName === 'string' || assignee.firstName === null
              ? (assignee.firstName as string | null)
              : undefined,
          lastName:
            typeof assignee.lastName === 'string' || assignee.lastName === null
              ? (assignee.lastName as string | null)
              : undefined,
        }
      : undefined,
  };
}

function toFiles(candidate: unknown): ProjectDetail['files'] {
  if (!Array.isArray(candidate)) {
    return undefined;
  }

  return candidate
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      if (typeof record.id !== 'string') {
        return null;
      }
      const uploader =
        record.uploader && typeof record.uploader === 'object'
          ? (record.uploader as Record<string, unknown>)
          : null;
      return {
        id: record.id,
        filename: typeof record.filename === 'string' ? record.filename : '',
        size: typeof record.size === 'number' ? record.size : undefined,
        mimetype: typeof record.mimetype === 'string' ? record.mimetype : undefined,
        createdAt:
          typeof record.createdAt === 'string'
            ? record.createdAt
            : typeof record.createdAt === 'number'
              ? new Date(record.createdAt).toISOString()
              : '',
        uploader: uploader
          ? {
              id: typeof uploader.id === 'string' ? uploader.id : '',
              username:
                typeof uploader.username === 'string' ? uploader.username : undefined,
              firstName:
                typeof uploader.firstName === 'string' || uploader.firstName === null
                  ? (uploader.firstName as string | null)
                  : undefined,
              lastName:
                typeof uploader.lastName === 'string' || uploader.lastName === null
                  ? (uploader.lastName as string | null)
                  : undefined,
            }
          : undefined,
      };
    })
    .filter((file): file is NonNullable<ProjectDetail['files']>[number] => Boolean(file));
}

export function extractProjectDetail(payload: unknown): ProjectDetail | null {
  const project = extractProject(payload);
  const source =
    payload && typeof payload === 'object'
      ? ((payload as Record<string, unknown>).data as Record<string, unknown> | undefined) ??
        (payload as Record<string, unknown>)
      : undefined;

  if (!project || !source) {
    return null;
  }

  const members = Array.isArray(source.members)
    ? (source.members as unknown[]).map((entry) => toMember(entry)).filter((m): m is ProjectMember => Boolean(m))
    : [];

  const tasks = Array.isArray(source.tasks)
    ? (source.tasks as unknown[]).map((entry) => toTask(entry)).filter((t): t is ProjectTask => Boolean(t))
    : [];

  const files = toFiles(source.files);

  return {
    ...project,
    updatedAt: project.updatedAt ?? project.createdAt,
    description:
      typeof source.description === 'string'
        ? source.description
        : source.description === null
          ? null
          : project.description ?? null,
    members,
    tasks,
    files,
  };
}

export function formatDate(value: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return '—';
  }

  try {
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    return new Intl.DateTimeFormat('en-US', options ?? { dateStyle: 'medium' }).format(date);
  } catch {
    return typeof value === 'string' ? value : '—';
  }
}

export function formatDateTime(value: string | number | Date | null | undefined) {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

export function extractTask(payload: unknown): ProjectTask | null {
  return toTask(payload);
}

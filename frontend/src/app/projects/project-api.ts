import { extractProject, extractTask } from './project-utils';
import type {
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ProjectRole,
  ProjectTask,
  ResponseEnvelope,
  UpdateTaskInput,
  UserSummary,
} from './types';

type CreateProjectSuccess = {
  success: true;
  project: Project;
};

type ApiErrorResult = {
  success: false;
  status: number;
  message: string;
};

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

function normaliseError(status: number, payload: unknown, fallback: string): ApiErrorResult {
  if (status === 401) {
    return { success: false, status, message: SESSION_EXPIRED_MESSAGE };
  }

  const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
  const message =
    typeof envelope.message === 'string'
      ? envelope.message
      : typeof envelope.error === 'string'
        ? envelope.error
        : fallback;

  return { success: false, status, message };
}

function normaliseException(error: unknown, fallback: string): ApiErrorResult {
  return {
    success: false,
    status: 0,
    message: error instanceof Error ? error.message : fallback,
  };
}

export type CreateProjectResult = CreateProjectSuccess | ApiErrorResult;

export async function createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to create project.');
    }

    const project = extractProject(payload);

    if (!project) {
      return {
        success: false,
        status: 502,
        message: 'Backend returned an unexpected project response.',
      };
    }

    return { success: true, project };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while creating the project.');
  }
}

export type DeleteProjectResult = { success: true } | ApiErrorResult;

export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (response.ok) {
      return { success: true };
    }

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return normaliseError(response.status, payload, 'Unable to delete project.');
  } catch (error) {
    return normaliseException(error, 'Something went wrong while deleting the project.');
  }
}

type CreateTaskSuccess = {
  success: true;
  task: ProjectTask;
};

export type CreateTaskResult = CreateTaskSuccess | ApiErrorResult;

export async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to create task.');
    }

    const task = extractTask(payload);

    if (!task) {
      return normaliseError(502, payload, 'Backend returned an unexpected task response.');
    }

    return { success: true, task };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while creating the task.');
  }
}

export type DeleteTaskResult = { success: true } | ApiErrorResult;

export async function deleteTask(taskId: string): Promise<DeleteTaskResult> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status >= 500) {
      return normaliseError(response.status, null, 'Unable to delete task.');
    }

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return normaliseError(response.status, payload, 'Unable to delete task.');
  } catch (error) {
    return normaliseException(error, 'Something went wrong while deleting the task.');
  }
}

type UpdateTaskSuccess = {
  success: true;
  task: ProjectTask;
};

export type UpdateTaskResult = UpdateTaskSuccess | ApiErrorResult;

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<UpdateTaskResult> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to update task.');
    }

    const task = extractTask(payload);

    if (!task) {
      return normaliseError(502, payload, 'Backend returned an unexpected task response.');
    }

    return { success: true, task };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while updating the task.');
  }
}

type LookupUserResult = { success: true; user: UserSummary } | ApiErrorResult;

export async function lookupUserByUsername(username: string): Promise<LookupUserResult> {
  try {
    const response = await fetch(`/api/users/username/${encodeURIComponent(username)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to find user by username.');
    }

    const envelope = (payload ?? {}) as ResponseEnvelope<UserSummary>;
    const user = envelope.data ?? (payload as UserSummary | null);

    if (!user || typeof user.id !== 'string') {
      return normaliseError(404, payload, 'User not found.');
    }

    return { success: true, user };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while looking up the user.');
  }
}

type MemberMutationResult = { success: true } | ApiErrorResult;

export async function addProjectMember(options: {
  projectId: string;
  userId: string;
  role: ProjectRole;
}): Promise<MemberMutationResult> {
  const { projectId, userId, role } = options;
  try {
    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to add project member.');
    }

    return { success: true };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while adding the member.');
  }
}

export async function updateProjectMemberRole(options: {
  projectId: string;
  userId: string;
  role: ProjectRole;
}): Promise<MemberMutationResult> {
  const { projectId, userId, role } = options;
  try {
    const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return normaliseError(response.status, payload, 'Unable to update member role.');
    }

    return { success: true };
  } catch (error) {
    return normaliseException(error, 'Something went wrong while updating the member.');
  }
}

export async function removeProjectMember(options: {
  projectId: string;
  userId: string;
}): Promise<MemberMutationResult> {
  const { projectId, userId } = options;
  try {
    const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status >= 500) {
      return normaliseError(response.status, null, 'Unable to remove project member.');
    }

    const payload = await response.json().catch(() => null);
    return normaliseError(response.status, payload, 'Unable to remove project member.');
  } catch (error) {
    return normaliseException(error, 'Something went wrong while removing the member.');
  }
}

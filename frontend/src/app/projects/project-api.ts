import { extractProject } from './project-utils';
import type { CreateProjectInput, Project, ResponseEnvelope } from './types';

type CreateProjectSuccess = {
  success: true;
  project: Project;
};

type CreateProjectError = {
  success: false;
  status: number;
  message: string;
};

export type CreateProjectResult = CreateProjectSuccess | CreateProjectError;

export async function createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (response.status === 401) {
      return {
        success: false,
        status: 401,
        message: 'Your session has expired. Please sign in again.',
      };
    }

    if (!response.ok) {
      const envelope = (payload ?? {}) as ResponseEnvelope<unknown>;
      const message =
        typeof envelope.message === 'string'
          ? envelope.message
          : typeof envelope.error === 'string'
            ? envelope.error
            : 'Unable to create project.';

      return {
        success: false,
        status: response.status,
        message,
      };
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
    return {
      success: false,
      status: 0,
      message:
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating the project.',
    };
  }
}

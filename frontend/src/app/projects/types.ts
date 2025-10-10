export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const PROJECT_ROLES: readonly ProjectRole[] = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];

export interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  description?: string | null;
}

export interface ResponseEnvelope<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  error?: unknown;
}

export interface MeResponse {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface ProjectMember {
  id: string;
  role: ProjectRole;
  joinedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  };
}

export interface ProjectTask {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string | null;
  assignee?: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export interface ProjectDetail extends Project {
  updatedAt: string;
  members: ProjectMember[];
  tasks: ProjectTask[];
  files?: Array<{
    id: string;
    filename: string;
    size?: number;
    mimetype?: string;
    createdAt: string;
    uploader?: {
      id: string;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  }>;
}

export interface UserSummary {
  id: string;
  username?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
}

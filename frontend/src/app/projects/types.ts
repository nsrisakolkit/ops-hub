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

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: string;
    name?: string;
  };
  creator?: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  creatorId?: string;
  assigneeId?: string | null;
  projectId?: string;
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

export interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  projectId: string;
  creator?: UserSummary;
  assignee?: UserSummary | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
}

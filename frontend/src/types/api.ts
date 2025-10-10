export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberSummary {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    avatar?: string | null;
  };
}

export interface ProjectEntity {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberSummary[];
  _count?: {
    tasks?: number;
    files?: number;
  };
}

export interface PaginatedProjectResponse {
  data: ProjectEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserProjectMembership {
  id: string;
  role: string;
  joinedAt: string;
  projectId: string;
  userId: string;
  project: ProjectEntity & {
    _count: {
      tasks: number;
      members: number;
    };
  };
}

export interface TaskAssigneeSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface UserTask {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: TaskAssigneeSummary | null;
}

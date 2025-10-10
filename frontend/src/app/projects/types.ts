export interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
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

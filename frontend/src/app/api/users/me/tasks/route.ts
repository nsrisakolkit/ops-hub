import { NextRequest, NextResponse } from 'next/server';
import type { UserTask } from '@/types/api';
import {
  backendFetchWithAuth,
  clearAuthCookies,
  parseBackendPayload,
  setAuthCookies,
} from '@/lib/server/backend-client';

type UserTasksPayload =
  | UserTask[]
  | {
      statusCode?: number;
      message?: string;
      error?: string;
    };

export async function GET(request: NextRequest) {
  const { response: backendResponse, tokens } = await backendFetchWithAuth(
    request,
    '/users/me/tasks',
  );

  const payload = await parseBackendPayload<UserTasksPayload>(backendResponse);

  const response = NextResponse.json(payload, {
    status: backendResponse.status,
  });

  if (tokens) {
    setAuthCookies(response, tokens);
  }

  if (backendResponse.status === 401) {
    clearAuthCookies(response);
  }

  return response;
}

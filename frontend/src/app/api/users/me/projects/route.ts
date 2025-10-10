import { NextRequest, NextResponse } from 'next/server';
import type { UserProjectMembership } from '@/types/api';
import {
  backendFetchWithAuth,
  clearAuthCookies,
  parseBackendPayload,
  setAuthCookies,
} from '@/lib/server/backend-client';

type UserProjectsPayload =
  | UserProjectMembership[]
  | {
      statusCode?: number;
      message?: string;
      error?: string;
    };

export async function GET(request: NextRequest) {
  const { response: backendResponse, tokens } = await backendFetchWithAuth(
    request,
    '/users/me/projects',
  );

  const payload = await parseBackendPayload<UserProjectsPayload>(backendResponse);

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

import { NextRequest, NextResponse } from 'next/server';
import type { PaginatedProjectResponse } from '@/types/api';
import {
  backendFetchWithAuth,
  clearAuthCookies,
  parseBackendPayload,
  setAuthCookies,
} from '@/lib/server/backend-client';

type ProjectsPayload =
  | PaginatedProjectResponse
  | {
      statusCode?: number;
      message?: string;
      error?: string;
    };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/projects?${query}` : '/projects';

  const { response: backendResponse, tokens } = await backendFetchWithAuth(
    request,
    path,
  );

  const payload = await parseBackendPayload<ProjectsPayload>(backendResponse);

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

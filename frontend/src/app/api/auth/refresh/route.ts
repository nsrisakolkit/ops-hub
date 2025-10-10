import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend-fetch';
import {
  clearAuthCookies,
  getAuthTokensFromRequest,
  setAuthCookies,
  type AuthTokens,
} from '@/lib/server/auth-cookies';

function extractTokens(payload: unknown, fallbackRefresh: string): AuthTokens | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const nested = candidate.data && typeof candidate.data === 'object'
    ? (candidate.data as Record<string, unknown>)
    : candidate;

  const accessToken = nested.accessToken;
  const refreshToken = nested.refreshToken;

  if (typeof accessToken !== 'string') {
    return null;
  }

  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : fallbackRefresh,
  };
}

export async function POST(request: NextRequest) {
  const { refreshToken } = getAuthTokensFromRequest(request);

  if (!refreshToken) {
    const response = NextResponse.json({ error: 'Refresh token missing.' }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const backendResponse = await backendFetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await backendResponse.json().catch(() => null);

  const tokens = extractTokens(payload, refreshToken);

  if (!backendResponse.ok || !tokens) {
    const errorMessage =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Unable to refresh session.';
    const response = NextResponse.json(
      { error: errorMessage, details: payload ?? undefined },
      { status: backendResponse.status === 200 ? 500 : backendResponse.status },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

  setAuthCookies(response, tokens);

  return response;
}

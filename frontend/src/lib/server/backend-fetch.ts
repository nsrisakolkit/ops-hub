import { NextRequest } from 'next/server';
import type { AuthTokens } from './auth-cookies';
import { getAuthTokensFromRequest } from './auth-cookies';

type BackendFetchResult = {
  response: Response;
  tokens?: AuthTokens;
  clearTokens?: boolean;
};

function getBackendBaseUrl(): string {
  const base = process.env.BACKEND_API_URL;
  if (!base) {
    throw new Error('BACKEND_API_URL must be configured.');
  }
  return base.replace(/\/$/, '');
}

function resolveBackendUrl(path: string): string {
  const base = getBackendBaseUrl();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

async function performRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  return fetch(resolveBackendUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return performRequest(path, init);
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  const response = await performRequest('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || typeof payload?.accessToken !== 'string') {
    return null;
  }

  const nextRefresh =
    typeof payload?.refreshToken === 'string' ? payload.refreshToken : refreshToken;

  return {
    accessToken: payload.accessToken,
    refreshToken: nextRefresh,
  };
}

export async function backendFetchWithAuth(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<BackendFetchResult> {
  const { accessToken, refreshToken } = getAuthTokensFromRequest(request);
  const headers = new Headers(init.headers);
  const originalBody = init.body;

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await performRequest(path, {
    ...init,
    headers,
    body: originalBody,
  });

  if (response.status !== 401 || !refreshToken) {
    return { response };
  }

  const refreshedTokens = await refreshTokens(refreshToken);
  if (!refreshedTokens) {
    return { response, clearTokens: true };
  }

  headers.set('Authorization', `Bearer ${refreshedTokens.accessToken}`);
  response = await performRequest(path, {
    ...init,
    headers,
    body: originalBody,
  });

  return { response, tokens: refreshedTokens };
}

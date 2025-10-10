import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'ops_access_token';
export const REFRESH_TOKEN_COOKIE = 'ops_refresh_token';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ONE_HOUR = 60 * 60;
const ONE_WEEK = ONE_HOUR * 24 * 7;
const isProduction = process.env.NODE_ENV === 'production';
const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

function resolveBackendUrl(path: string): string {
  if (!path.startsWith('/')) {
    return `${backendBaseUrl}/${path}`;
  }
  return `${backendBaseUrl}${path}`;
}

async function tryParseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractTokenPayload(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const container = payload as Record<string, unknown>;
  const candidate =
    container.data && typeof container.data === 'object'
      ? (container.data as Record<string, unknown>)
      : container;

  const accessToken = candidate.accessToken;
  if (typeof accessToken !== 'string') {
    return null;
  }

  const refreshToken = candidate.refreshToken;

  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : '',
  };
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = resolveBackendUrl(path);
  return fetch(url, {
    ...init,
    cache: 'no-store',
  });
}

export async function backendFetchWithAuth(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; tokens?: AuthTokens }> {
  const url = resolveBackendUrl(path);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  const headers = new Headers(init.headers ?? {});

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const fetchInit: RequestInit = {
    ...init,
    headers,
    cache: 'no-store',
  };

  const originalBody = init.body;

  let response = await fetch(url, fetchInit);

  if (response.status !== 401 || !refreshToken) {
    return { response };
  }

  const refreshResponse = await fetch(resolveBackendUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) {
    return { response };
  }

  const extracted = extractTokenPayload(await tryParseJson(refreshResponse));

  if (!extracted?.accessToken) {
    return { response };
  }

  const newTokens: AuthTokens = {
    accessToken: extracted.accessToken,
    refreshToken: extracted.refreshToken || refreshToken,
  };

  headers.set('Authorization', `Bearer ${newTokens.accessToken}`);

  response = await fetch(url, {
    ...fetchInit,
    headers,
    body: originalBody,
  });

  return { response, tokens: newTokens };
}

export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_HOUR,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function decodeAccessTokenSubject(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return typeof parsed?.sub === 'string' ? parsed.sub : null;
  } catch {
    return null;
  }
}

export async function parseBackendPayload<T>(response: Response): Promise<T> {
  const payload = await tryParseJson(response);

  if (!payload || typeof payload !== 'object') {
    return payload as T;
  }

  const container = payload as Record<string, unknown>;

  if (container.data !== undefined) {
    return (container.data as T) ?? (payload as T);
  }

  return payload as T;
}

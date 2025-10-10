import { NextRequest, NextResponse } from 'next/server';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const ACCESS_TOKEN_COOKIE = 'ops_access_token';
export const REFRESH_TOKEN_COOKIE = 'ops_refresh_token';

const ACCESS_MAX_AGE_SECONDS = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const isProduction = process.env.NODE_ENV === 'production';

export function setAuthCookies(response: NextResponse, tokens: AuthTokens): void {
  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('Both accessToken and refreshToken are required to set cookies.');
  }

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse): void {
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

export function getAuthTokensFromRequest(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

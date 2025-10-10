import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend-fetch';
import {
  clearAuthCookies,
  setAuthCookies,
  type AuthTokens,
} from '@/lib/server/auth-cookies';

function extractTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const nested = candidate.data && typeof candidate.data === 'object'
    ? (candidate.data as Record<string, unknown>)
    : candidate;

  const accessToken = nested.accessToken;
  const refreshToken = nested.refreshToken;

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email?.toString().trim();
    const password = body?.password?.toString() ?? '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const backendResponse = await backendFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      const errorMessage =
        typeof payload?.message === 'string'
          ? payload.message
          : 'Authentication failed.';
      const response = NextResponse.json(
        { error: errorMessage, details: payload ?? undefined },
        { status: backendResponse.status },
      );
      clearAuthCookies(response);
      return response;
    }

    const tokens = extractTokens(payload);

    if (!tokens) {
      const response = NextResponse.json(
        { error: 'Backend response missing required tokens.', details: payload ?? undefined },
        { status: 502 },
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Unexpected error during login.', details: (error as Error).message },
      { status: 500 },
    );
    clearAuthCookies(response);
    return response;
  }
}

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
  const root =
    candidate.data && typeof candidate.data === 'object'
      ? (candidate.data as Record<string, unknown>)
      : candidate;

  const possible = [root, root.tokens as Record<string, unknown> | undefined];

  for (const entry of possible) {
    if (!entry) continue;
    const accessToken = entry.accessToken;
    const refreshToken = entry.refreshToken;
    if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
      return { accessToken, refreshToken };
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email?.toString().trim();
    const password = body?.password?.toString() ?? '';
    const confirmPassword = body?.confirmPassword?.toString() ?? '';
    const username = body?.username?.toString().trim();
    const firstName = body?.firstName?.toString().trim();
    const lastName = body?.lastName?.toString().trim();

    if (!email || !password || !username || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, username, password, first name and last name are required.' },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 },
      );
    }

    const backendResponse = await backendFetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          email,
          password,
          username,
          firstName,
          lastName,
        }),
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      const message =
        typeof payload?.message === 'string'
          ? payload.message
          : 'Registration failed.';
      const response = NextResponse.json(
        { error: message, details: payload ?? undefined },
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

    const response = NextResponse.json({ success: true, user: payload?.user ?? null });
    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Unexpected error during registration.', details: (error as Error).message },
      { status: 500 },
    );
    clearAuthCookies(response);
    return response;
  }
}

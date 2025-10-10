import { NextRequest, NextResponse } from 'next/server';
import {
  backendFetch,
  parseBackendPayload,
  setAuthCookies,
} from '@/lib/server/backend-client';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

type UserProfile = {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email?.toString().trim();
    const password = body?.password?.toString() ?? '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const backendResponse = await backendFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginPayload = await parseBackendPayload<LoginResponse>(backendResponse);

    if (
      !backendResponse.ok ||
      !loginPayload?.accessToken ||
      !loginPayload?.refreshToken
    ) {
      const errorPayload =
        (loginPayload as Record<string, unknown>) ?? {
          error: 'Authentication failed',
        };
      return NextResponse.json(errorPayload, {
        status: backendResponse.status,
      });
    }

    let user: UserProfile | null = null;

    try {
      const profileResponse = await backendFetch('/users/me', {
        headers: {
          Authorization: `Bearer ${loginPayload.accessToken}`,
        },
      });

      if (profileResponse.ok) {
        user = await parseBackendPayload<UserProfile>(profileResponse);
      }
    } catch {
      user = null;
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    setAuthCookies(response, {
      accessToken: loginPayload.accessToken,
      refreshToken: loginPayload.refreshToken,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

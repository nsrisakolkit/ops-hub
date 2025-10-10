import { NextRequest, NextResponse } from 'next/server';
import {
  backendFetch,
  parseBackendPayload,
  setAuthCookies,
} from '@/lib/server/backend-client';
import type { UserProfile } from '@/types/api';

type RegisterResponse = {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email?.toString().trim();
    const username = body?.username?.toString().trim();
    const password = body?.password?.toString() ?? '';
    const firstName = body?.firstName?.toString() ?? undefined;
    const lastName = body?.lastName?.toString() ?? undefined;
    const role = body?.role?.toString() ?? undefined;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username and password are required' },
        { status: 400 },
      );
    }

    const backendResponse = await backendFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        firstName,
        lastName,
        role,
      }),
    });

    const registerPayload = await parseBackendPayload<RegisterResponse>(
      backendResponse,
    );

    if (
      !backendResponse.ok ||
      !registerPayload?.tokens?.accessToken ||
      !registerPayload?.tokens?.refreshToken
    ) {
      const errorPayload =
        (registerPayload as Record<string, unknown>) ?? {
          error: 'Registration failed',
        };
      return NextResponse.json(errorPayload, {
        status: backendResponse.status,
      });
    }

    const response = NextResponse.json({
      success: true,
      user: registerPayload.user,
    });

    setAuthCookies(response, {
      accessToken: registerPayload.tokens.accessToken,
      refreshToken: registerPayload.tokens.refreshToken,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

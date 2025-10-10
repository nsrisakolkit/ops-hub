import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  backendFetch,
  clearAuthCookies,
  decodeAccessTokenSubject,
} from '@/lib/server/backend-client';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const userId = accessToken ? decodeAccessTokenSubject(accessToken) : null;

  if (accessToken && userId) {
    try {
      await backendFetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Intentionally swallow errors to ensure logout proceeds client-side
    }
  }

  clearAuthCookies(response);

  return response;
}

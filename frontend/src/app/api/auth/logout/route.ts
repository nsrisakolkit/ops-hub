import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies } from '@/lib/server/auth-cookies';

export async function POST(request: NextRequest) {
  const { response: backendResponse } = await backendFetchWithAuth(
    request,
    '/auth/logout',
    {
      method: 'POST',
    },
  );

  const payload = await backendResponse.json().catch(() => null);

  const response = backendResponse.ok
    ? NextResponse.json({ success: true })
    : NextResponse.json(
        {
          error:
            typeof payload?.message === 'string'
              ? payload.message
              : 'Unable to log out.',
          details: payload ?? undefined,
        },
        { status: backendResponse.status },
      );

  clearAuthCookies(response);
  return response;
}

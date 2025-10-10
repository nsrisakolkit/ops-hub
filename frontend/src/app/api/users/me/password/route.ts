import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies, setAuthCookies } from '@/lib/server/auth-cookies';

export async function PATCH(request: NextRequest) {
  const body = await request.text();
  const { response, tokens, clearTokens } = await backendFetchWithAuth(
    request,
    '/users/me/password',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );

  const payload = await response.json().catch(() => null);
  const outgoing = NextResponse.json(
    payload ?? (response.ok ? { success: true } : { error: 'Unexpected backend response.' }),
    { status: response.status },
  );

  if (tokens) {
    setAuthCookies(outgoing, tokens);
  } else if (clearTokens) {
    clearAuthCookies(outgoing);
  }

  return outgoing;
}

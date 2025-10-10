import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies, setAuthCookies } from '@/lib/server/auth-cookies';

async function proxyWithAuth(request: NextRequest): Promise<NextResponse> {
  const { response, tokens, clearTokens } = await backendFetchWithAuth(request, '/users/me', {
    method: 'GET',
  });

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

export async function GET(request: NextRequest) {
  return proxyWithAuth(request);
}

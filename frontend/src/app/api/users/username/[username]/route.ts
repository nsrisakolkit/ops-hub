import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies, setAuthCookies } from '@/lib/server/auth-cookies';

interface RouteContext {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { username } = await context.params;
  const encoded = encodeURIComponent(username);

  const { response, tokens, clearTokens } = await backendFetchWithAuth(
    request,
    `/users/username/${encoded}`,
    { method: 'GET' },
  );

  const payload = await response.json().catch(() => null);

  const outgoing = NextResponse.json(
    payload ?? (response.ok ? { data: null } : { error: 'Unexpected backend response.' }),
    { status: response.status },
  );

  if (tokens) {
    setAuthCookies(outgoing, tokens);
  } else if (clearTokens) {
    clearAuthCookies(outgoing);
  }

  return outgoing;
}

import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies, setAuthCookies } from '@/lib/server/auth-cookies';

function buildPath(request: NextRequest): string {
  const url = new URL(request.url);
  return url.search ? `/projects${url.search}` : '/projects';
}

async function proxyWithAuth(
  request: NextRequest,
  path: string,
  init: RequestInit,
): Promise<NextResponse> {
  const { response, tokens, clearTokens } = await backendFetchWithAuth(request, path, init);
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
  return proxyWithAuth(request, buildPath(request), { method: 'GET' });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  return proxyWithAuth(request, '/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

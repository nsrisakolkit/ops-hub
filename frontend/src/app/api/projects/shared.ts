import { NextRequest, NextResponse } from 'next/server';
import { backendFetchWithAuth } from '@/lib/server/backend-fetch';
import { clearAuthCookies, setAuthCookies } from '@/lib/server/auth-cookies';

export async function proxyProjectRequest(
  request: NextRequest,
  path: string,
  init: RequestInit,
): Promise<NextResponse> {
  const { response, tokens, clearTokens } = await backendFetchWithAuth(request, path, init);
  const status = response.status;
  const hasBody = status !== 204 && status !== 205 && status !== 304;

  const payload = hasBody ? await response.json().catch(() => null) : null;

  const outgoing = hasBody
    ? NextResponse.json(
        payload ?? (response.ok ? { success: true } : { error: 'Unexpected backend response.' }),
        { status },
      )
    : new NextResponse(null, { status });

  if (tokens) {
    setAuthCookies(outgoing, tokens);
  } else if (clearTokens) {
    clearAuthCookies(outgoing);
  }

  return outgoing;
}

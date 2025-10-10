import { cookies, headers } from 'next/headers';

function resolveAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) {
    return envUrl;
  }

  const incomingHeaders = headers();
  const host =
    incomingHeaders.get('x-forwarded-host') ??
    incomingHeaders.get('host') ??
    'localhost:3000';
  const protocol =
    incomingHeaders.get('x-forwarded-proto') ??
    (host.includes('localhost') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

export async function fetchFromBff<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; ok: boolean; status: number }> {
  const baseUrl = resolveAppBaseUrl();
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const headersInit = new Headers(init.headers ?? {});
  if (cookieHeader) {
    headersInit.set('cookie', cookieHeader);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: headersInit,
    cache: 'no-store',
  });

  let data: T | null = null;
  try {
    const text = await response.text();
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }

  return { data, ok: response.ok, status: response.status };
}

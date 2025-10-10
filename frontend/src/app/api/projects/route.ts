import { NextRequest } from 'next/server';
import { proxyProjectRequest } from './shared';

function buildPath(request: NextRequest): string {
  const url = new URL(request.url);
  return url.search ? `/projects${url.search}` : '/projects';
}

export async function GET(request: NextRequest) {
  return proxyProjectRequest(request, buildPath(request), { method: 'GET' });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  return proxyProjectRequest(request, '/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

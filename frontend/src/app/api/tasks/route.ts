import { NextRequest } from 'next/server';
import { proxyTaskRequest } from './shared';

export async function POST(request: NextRequest) {
  const body = await request.text();

  return proxyTaskRequest(request, '/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

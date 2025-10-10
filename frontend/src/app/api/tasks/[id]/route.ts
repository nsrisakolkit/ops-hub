import { NextRequest } from 'next/server';
import { proxyTaskRequest } from '../shared';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyTaskRequest(request, `/tasks/${id}`, { method: 'GET' });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyTaskRequest(request, `/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyTaskRequest(request, `/tasks/${id}`, { method: 'DELETE' });
}

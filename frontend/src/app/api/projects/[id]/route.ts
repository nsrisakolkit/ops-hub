import { NextRequest } from 'next/server';
import { proxyProjectRequest } from '../shared';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyProjectRequest(request, `/projects/${id}`, { method: 'GET' });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyProjectRequest(request, `/projects/${id}`, { method: 'DELETE' });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyProjectRequest(request, `/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

import { NextRequest } from 'next/server';
import { proxyProjectRequest } from '../../../shared';

interface RouteContext {
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id, userId } = await context.params;
  const body = await request.text();

  return proxyProjectRequest(request, `/projects/${id}/members/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id, userId } = await context.params;
  return proxyProjectRequest(request, `/projects/${id}/members/${userId}`, {
    method: 'DELETE',
  });
}

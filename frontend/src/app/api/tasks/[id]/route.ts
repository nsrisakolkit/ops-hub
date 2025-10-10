import { NextRequest } from 'next/server';
import { proxyTaskRequest } from '../shared';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyTaskRequest(request, `/tasks/${id}`, { method: 'DELETE' });
}

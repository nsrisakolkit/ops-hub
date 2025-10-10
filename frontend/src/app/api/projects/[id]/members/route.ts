import { NextRequest } from 'next/server';
import { proxyProjectRequest } from '../../shared';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyProjectRequest(request, `/projects/${id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

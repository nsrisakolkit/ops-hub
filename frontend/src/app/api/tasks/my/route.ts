import { NextRequest } from 'next/server';
import { proxyTaskRequest } from '../shared';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.search ? `?${url.searchParams.toString()}` : '';

  return proxyTaskRequest(request, `/tasks/my-tasks${query}`, {
    method: 'GET',
  });
}

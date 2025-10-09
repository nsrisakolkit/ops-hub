import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  // TODO: Verify JWT token and get user from database
  // For now, return mock user data
  return NextResponse.json({
    user: {
      id: '1',
      email: 'user@example.com',
      name: 'User',
    }
  });
}
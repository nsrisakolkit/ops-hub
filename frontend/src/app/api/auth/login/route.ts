import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // TODO: Replace with actual authentication logic
    // For now, accept any email/password combination
    if (email && password) {
      // Set a mock JWT token in httpOnly cookie
      const response = NextResponse.json({ 
        success: true, 
        user: { email, id: '1', name: 'User' } 
      });
      
      response.cookies.set('auth-token', 'mock-jwt-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      return response;
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handle user logout
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear all authentication cookies
    cookieStore.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    cookieStore.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    cookieStore.set('user_info', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
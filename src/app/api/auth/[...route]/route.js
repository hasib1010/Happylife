// src/app/api/auth/[...route]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import authService from '@/services/auth.service';
import { connectDB } from '@/lib/mongoose';

// Helper function to get client IP
const getClientIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
};

// Register a new user
export async function POST(request, { params }) {
  try {
    await connectDB();
    const route = params.route;

    // Route: /api/auth/register
    if (route.includes('register')) {
      const data = await request.json();
      const { name, email, password } = data;

      // Validate input
      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await authService.register({ name, email, password });

      // TODO: Send verification email here

      return NextResponse.json(
        { 
          success: true, 
          message: 'User registered successfully',
          user: result.user
        },
        { status: 201 }
      );
    }

    // Route: /api/auth/login
    if (route.includes('login')) {
      const data = await request.json();
      const { email, password } = data;

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || '';

      const result = await authService.login(email, password, ipAddress, userAgent);

      // Set cookies for authentication
      const cookieStore = cookies();
      
      // Access token (short-lived)
      cookieStore.set('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      // Refresh token (long-lived)
      cookieStore.set('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      // Set a non-HttpOnly cookie with user info for client
      cookieStore.set('user_info', JSON.stringify({
        id: result.user._id,
        accountType: result.user.accountType,
        role: result.user.role
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accountType: result.user.accountType,
          isVerified: result.user.isEmailVerified,
          twoFactorEnabled: result.user.twoFactorEnabled
        }
      });
    }

    // Route: /api/auth/refresh
    if (route.includes('refresh')) {
      const cookieStore = cookies();
      const refreshToken = cookieStore.get('refresh_token')?.value;
      
      if (!refreshToken) {
        return NextResponse.json(
          { success: false, message: 'Refresh token not found' },
          { status: 401 }
        );
      }
      
      const tokens = await authService.refreshToken(refreshToken);
      
      // Update cookies
      cookieStore.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      cookieStore.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    }

    // Route: /api/auth/logout
    if (route.includes('logout')) {
      const cookieStore = cookies();
      
      // Clear all authentication cookies
      cookieStore.set('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      cookieStore.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      cookieStore.set('user_info', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // Route: /api/auth/verify-email
    if (route.includes('verify-email')) {
      const data = await request.json();
      const { token } = data;
      
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Verification token is required' },
          { status: 400 }
        );
      }
      
      await authService.verifyEmail(token);
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully'
      });
    }

    // Route: /api/auth/reset-password-request
    if (route.includes('reset-password-request')) {
      const data = await request.json();
      const { email } = data;
      
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }
      
      const resetToken = await authService.requestPasswordReset(email);
      
      // TODO: Send password reset email with the token
      
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Route: /api/auth/reset-password
    if (route.includes('reset-password')) {
      const data = await request.json();
      const { token, newPassword } = data;
      
      if (!token || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Token and new password are required' },
          { status: 400 }
        );
      }
      
      await authService.resetPassword(token, newPassword);
      
      return NextResponse.json({
        success: true,
        message: 'Password reset successfully'
      });
    }

    // Route not found
    return NextResponse.json(
      { success: false, message: 'Route not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

// Methods for routes that use GET
export async function GET(request, { params }) {
  try {
    await connectDB();
    const route = params.route;

    // Route: /api/auth/me
    if (route.includes('me')) {
      const cookieStore = cookies();
      const accessToken = cookieStore.get('access_token')?.value;
      
      if (!accessToken) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      const decoded = authService.verifyToken(accessToken);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // Get user from database
      const User = require('@/models/User').default;
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          isVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          profileImage: user.profileImage,
          permissions: user.getPermissions()
        }
      });
    }

    // Route not found
    return NextResponse.json(
      { success: false, message: 'Route not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
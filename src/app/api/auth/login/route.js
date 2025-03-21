// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Helper function to get client IP
const getClientIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
};

/**
 * Handle user login
 */
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { email, password } = data;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Account is temporarily locked. Try again later.',
          lockedUntil: user.lockUntil
        },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if email verification is required and not verified
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email address before logging in' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;

    // Update last login information
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    user.lastLogin = {
      date: new Date(),
      ip: ipAddress,
      userAgent
    };

    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
        accountType: user.accountType 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Set cookies
    const cookieStore = cookies();
    
    // Access token (short-lived)
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });
    
    // Refresh token (long-lived)
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    // Non-HttpOnly cookie with user info for client
    cookieStore.set('user_info', JSON.stringify({
      id: user._id,
      accountType: user.accountType,
      role: user.role
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        isVerified: user.isEmailVerified,
        profileImage: user.profileImage,
        permissions: user.getPermissions()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Refresh access token using refresh token
 */
export async function GET(request) {
  try {
    // Check for redirect parameter
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirect');
    
    // Get refresh token from cookie
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      // If redirect parameter is present, redirect to login
      if (redirectTo) {
        const callbackUrl = encodeURIComponent(redirectTo);
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}&error=session_expired`, request.url));
      }
      
      return NextResponse.json(
        { success: false, message: 'Refresh token not found' },
        { status: 401 }
      );
    }
    
    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      
      // Connect to database
      await connectDB();
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('Invalid user');
      }
      
      // Generate new tokens
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
      
      const newRefreshToken = jwt.sign(
        { id: user._id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );
      
      // Set new cookies
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      cookieStore.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      // Update user_info cookie
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
      
      // If redirect parameter is present, redirect to that URL
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
      
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      // If token verification fails, redirect to login or return error
      if (redirectTo) {
        const callbackUrl = encodeURIComponent(redirectTo);
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}&error=session_expired`, request.url));
      }
      
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Refresh token - POST method alternative
 */
export async function POST() {
  try {
    // Get refresh token from cookie
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token not found' },
        { status: 401 }
      );
    }
    
    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      
      // Connect to database
      await connectDB();
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('Invalid user');
      }
      
      // Generate new tokens
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
      
      const newRefreshToken = jwt.sign(
        { id: user._id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );
      
      // Set new cookies
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      });
      
      cookieStore.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      // Update user_info cookie
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
      
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
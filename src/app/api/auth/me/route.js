// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Get current user (detailed profile)
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Get token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get complete user details
      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountType: user.accountType,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          subscriptionStatus: user.subscriptionStatus,
          twoFactorEnabled: user.twoFactorEnabled,
          permissions: user.getPermissions(),
          lastLogin: user.lastLogin ? {
            date: user.lastLogin.date,
            ip: user.lastLogin.ip
          } : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Include referential information (bookings, saved items, etc.)
          savedProducts: user.savedProducts || [],
          savedProviders: user.savedProviders || [],
          bookings: user.bookings || []
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
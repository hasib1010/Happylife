// src/app/api/auth/profile/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Get user profile
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
          permissions: user.getPermissions()
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 */
export async function PUT(request) {
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
      
      // Get request data
      const data = await request.json();
      const { name, profileImage } = data;
      
      // Prevent updating sensitive fields
      const updateData = {};
      if (name) updateData.name = name;
      if (profileImage) updateData.profileImage = profileImage;
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          accountType: updatedUser.accountType,
          profileImage: updatedUser.profileImage,
          isEmailVerified: updatedUser.isEmailVerified,
          permissions: updatedUser.getPermissions()
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
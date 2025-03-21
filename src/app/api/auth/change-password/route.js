// src/app/api/auth/change-password/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Change user password
 */
export async function POST(request) {
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
      const { currentPassword, newPassword } = data;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password and new password are required' },
          { status: 400 }
        );
      }
      
      // Find user with password
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Password policy checks
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      user.password = hashedPassword;
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
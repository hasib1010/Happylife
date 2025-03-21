// src/app/api/auth/permissions/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { PERMISSIONS } from '@/lib/constants';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Get user permissions
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
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get permissions
      const permissions = user.getPermissions();
      
      return NextResponse.json({
        success: true,
        role: user.role,
        accountType: user.accountType,
        permissions
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Check specific permission (mainly for admin use)
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
      const { area, level } = data;
      
      // Validate input
      if (!area || !level) {
        return NextResponse.json(
          { success: false, message: 'Area and permission level are required' },
          { status: 400 }
        );
      }
      
      // Check if level is valid
      if (!Object.values(PERMISSIONS).includes(level)) {
        return NextResponse.json(
          { success: false, message: 'Invalid permission level' },
          { status: 400 }
        );
      }
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Check permission
      const hasPermission = user.hasPermission(area, level);
      
      return NextResponse.json({
        success: true,
        hasPermission,
        userRole: user.role,
        requestedAccess: {
          area,
          level
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Check permission error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
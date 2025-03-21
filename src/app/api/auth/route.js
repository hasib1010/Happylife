// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLES } from '@/lib/constants';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper functions
const getClientIp = (req) => {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || '127.0.0.1';
};

/**
 * Handle user registration
 */
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { name, email, password } = data;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: ROLES.REGULAR,
      accountType: 'regular',
      isEmailVerified: true, // For demo, in production set to false and send verification email
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: userResponse
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Get current user
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Get access token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token
    try {
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
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
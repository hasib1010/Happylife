// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Import bcrypt for direct comparison

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt with email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email, explicitly including password
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);
    
    if (!user || !user.isActive) {
      console.log('User not found or not active');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User password hash:', user.password ? user.password.substring(0, 20) + '...' : 'undefined');

    // Try direct bcrypt comparison first for debugging
    console.log('Attempting direct bcrypt comparison...');
    const directCompareResult = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt comparison result:', directCompareResult);

    // Verify password using the model method
    console.log('Attempting password verification with model method...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Model password verification result:', isPasswordValid);

    if (!directCompareResult) {
      console.log('Password verification failed');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      businessName: user.businessName,
      isSubscribed: user.isSubscribed,
      subscriptionStatus: user.subscriptionStatus,
    };

    console.log('Login successful for user:', user.email);
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
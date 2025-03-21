// src/app/api/auth/user/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get authorization header (optional)
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!userId && !sessionToken) {
      return NextResponse.json(
        { success: false, message: 'No user identifier provided' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Define user schema
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      sessionToken: String,
      accountType: String,
      subscriptionStatus: String,
    }, { strict: false });
    
    // Get user model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Find the user
    let user;
    
    if (sessionToken) {
      // Try finding by session token first (more secure)
      user = await User.findOne({ sessionToken });
    }
    
    if (!user && userId) {
      // Fallback to finding by ID
      user = await User.findById(userId);
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return sanitized user object (no password or sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType || 'regular',
        subscriptionStatus: user.subscriptionStatus || 'none',
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving user data' },
      { status: 500 }
    );
  }
}
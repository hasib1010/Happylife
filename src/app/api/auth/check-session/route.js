
// src/app/api/auth/check-session/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      sessionToken: String,
      sessionExpiry: Date,
      name: String,
      email: String,
      accountType: String,
      subscriptionStatus: String,
    }));
    
    // Find user with matching session token
    const user = await User.findOne({ 
      sessionToken,
      sessionExpiry: { $gt: new Date() } // Token hasn't expired
    });
    
    if (!user) {
      // Clear invalid cookie
      cookies().delete('session_token');
      return NextResponse.json({ authenticated: false });
    }
    
    // Return sanitized user info
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus,
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { message: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
}
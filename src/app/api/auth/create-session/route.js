// src/app/api/auth/create-session/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { userId, sessionToken } = await request.json();
    
    if (!userId || !sessionToken) {
      return NextResponse.json(
        { message: 'User ID and session token are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      sessionToken: String,
      sessionExpiry: Date,
    }));
    
    // Calculate session expiration (24 hours from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    // Update user with session token
    await User.findByIdAndUpdate(
      userId,
      {
        sessionToken,
        sessionExpiry: expiryDate,
      }
    );
    
    // Set cookie
    cookies().set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

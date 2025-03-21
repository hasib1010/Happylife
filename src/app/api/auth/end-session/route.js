
// src/app/api/auth/end-session/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (sessionToken) {
      // Connect to database
      await connectToDatabase();
      
      // Get the User model
      const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
        sessionToken: String,
      }));
      
      // Clear session token from user
      await User.findOneAndUpdate(
        { sessionToken },
        {
          $unset: { sessionToken: 1, sessionExpiry: 1 }
        }
      );
      
      // Clear cookie
      cookies().delete('session_token');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

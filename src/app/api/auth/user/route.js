// src/app/api/auth/user/route.js
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-utils';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Get the currently authenticated user
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Return sanitized user object with latest data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus,
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
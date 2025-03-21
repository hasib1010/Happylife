// src/app/api/subscriptions/manage/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import { createPortalSession } from '@/lib/stripe';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get access token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get request data
    const data = await request.json();
    const { returnUrl = `${BASE_URL}/dashboard` } = data;
    
    // Check if user has Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: 'No subscription found for this user' },
        { status: 400 }
      );
    }
    
    // Create portal session
    const session = await createPortalSession(
      user.stripeCustomerId, 
      returnUrl
    );
    
    return NextResponse.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
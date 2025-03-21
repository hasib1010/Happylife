// src/app/api/subscriptions/status/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import {
  getSubscriptionForCustomer,
  mapSubscriptionStatus
} from '@/lib/stripe';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function GET(request) {
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
    
    // Check if user has Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          hasSubscription: false,
          subscription: null
        }
      });
    }
    
    // Get subscription from Stripe
    const subscription = await getSubscriptionForCustomer(user.stripeCustomerId);
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          hasSubscription: false,
          subscription: null
        }
      });
    }
    
    // Calculate days until renewal
    const currentPeriodEnd = subscription.current_period_end * 1000; // Convert to milliseconds
    const now = Date.now();
    const daysUntilRenewal = Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
    
    // Map Stripe subscription to our format
    const mappedSubscription = {
      id: subscription.id,
      status: mapSubscriptionStatus(subscription.status),
      plan: user.role || user.accountType,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      autoRenew: !subscription.cancel_at_period_end,
      daysUntilRenewal
    };
    
    // Update user's subscription status in the database if it differs
    if (user.subscriptionStatus !== mappedSubscription.status) {
      user.subscriptionStatus = mappedSubscription.status;
      await user.save();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: mappedSubscription
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
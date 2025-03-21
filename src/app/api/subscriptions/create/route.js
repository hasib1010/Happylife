// src/app/api/subscriptions/create/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import stripe, { 
  createOrRetrieveCustomer,
  createCheckoutSession,
  getSubscriptionForCustomer
} from '@/lib/stripe';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
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
    
    // Get request data
    const data = await request.json();
    const { accountType, userIdFromClient } = data;
    
    // Validate input
    if (!accountType) {
      return NextResponse.json(
        { success: false, message: 'Account type is required' },
        { status: 400 }
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
    
    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      // Return URL to the billing portal instead
      return NextResponse.json({
        success: true,
        message: 'User already has an active subscription',
        data: {
          hasExistingSubscription: true,
          redirectToDashboard: true
        }
      });
    }
    
    // Get or create Stripe customer
    const customer = await createOrRetrieveCustomer({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Store Stripe customer ID if not already stored
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: customer.id,
      priceId: SUBSCRIPTION_PRICE_ID,
      successUrl: `${BASE_URL}/subscribe/success?type=${accountType}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${BASE_URL}/subscribe/checkout?canceled=true`,
      metadata: {
        userId: user._id.toString(),
        accountType
      }
    });
    
    if (!checkoutSession.success) {
      return NextResponse.json(
        { success: false, message: checkoutSession.error || 'Failed to create checkout session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.sessionId
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
// src/app/api/subscription/verify/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Subscription from '@/models/subscription';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Retrieve Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!checkoutSession) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID' },
        { status: 400 }
      );
    }
    
    // Ensure the session belongs to the current user
    if (checkoutSession.metadata.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Session does not belong to current user' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get user data
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify the session is paid
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, message: 'Payment not completed' },
        { status: 400 }
      );
    }
    
    // Get subscription ID from checkout session
    const subscriptionId = checkoutSession.subscription;
    
    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, message: 'No subscription found in session' },
        { status: 400 }
      );
    }
    
    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Check if subscription already exists in database
    const existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscriptionId,
    });
    
    if (existingSubscription) {
      return NextResponse.json({ success: true });
    }
    
    // Create new subscription record
    const subscription = new Subscription({
      userId: user._id,
      stripeCustomerId: checkoutSession.customer,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: checkoutSession.line_items?.data[0]?.price?.id || process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });
    
    await subscription.save();
    
    // Update user subscription data
    user.isSubscribed = true;
    user.stripeCustomerId = checkoutSession.customer;
    user.stripeSubscriptionId = subscriptionId;
    user.subscriptionStatus = stripeSubscription.status;
    user.subscriptionPlan = 'standard'; // Only one plan for now
    user.subscriptionStart = new Date(stripeSubscription.current_period_start * 1000);
    user.subscriptionEnd = new Date(stripeSubscription.current_period_end * 1000);
    
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
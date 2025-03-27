// src/app/api/subscription/cancel/route.js
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
    
    // Check if user has a subscription
    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, message: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // Get subscription from database
    const subscription = await Subscription.findOne({
      userId: user._id,
      stripeSubscriptionId: user.stripeSubscriptionId,
    });
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found in database' },
        { status: 404 }
      );
    }
    
    // If already set to cancel at period end, return success
    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json({
        success: true,
        message: 'Subscription is already set to cancel at the end of the billing period',
      });
    }
    
    // Cancel the subscription at period end
    const updatedStripeSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    
    // Update subscription in database
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    
    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
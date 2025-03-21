
// src/app/api/subscriptions/cancel/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerUser } from '@/lib/auth-utils';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Get the authenticated user
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { cancelImmediately = false } = await request.json();
    
    // Connect to the database
    await connectToDatabase();
    
    // Get subscription model
    const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', mongoose.Schema);
    
    // Find user's subscription
    const subscription = await Subscription.findOne({ user: user._id });
    
    if (!subscription) {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      );
    }
    
    if (cancelImmediately) {
      // Cancel subscription immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      // Update our database
      subscription.status = 'canceled';
      subscription.autoRenew = false;
      subscription.cancelAtPeriodEnd = true;
      subscription.canceledAt = new Date();
      subscription.updatedAt = new Date();
      await subscription.save();
      
      // Update user status
      user.subscriptionStatus = 'none';
      user.accountType = 'regular';
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: 'Subscription canceled immediately',
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      
      // Update our database
      subscription.autoRenew = false;
      subscription.cancelAtPeriodEnd = true;
      subscription.updatedAt = new Date();
      await subscription.save();
      
      return NextResponse.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period',
      });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
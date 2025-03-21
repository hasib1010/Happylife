
// src/app/api/subscriptions/toggle-auto-renew/route.js
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
    
    const { autoRenew } = await request.json();
    
    if (typeof autoRenew !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid autoRenew value' },
        { status: 400 }
      );
    }
    
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
    
    // Update the subscription with Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: !autoRenew,
    });
    
    // Update our database
    subscription.autoRenew = autoRenew;
    subscription.cancelAtPeriodEnd = !autoRenew;
    subscription.updatedAt = new Date();
    await subscription.save();
    
    return NextResponse.json({
      success: true,
      message: autoRenew ? 'Subscription auto-renewal enabled' : 'Subscription auto-renewal disabled',
      data: {
        autoRenew,
        cancelAtPeriodEnd: !autoRenew,
      }
    });
  } catch (error) {
    console.error('Error toggling auto-renewal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API Path: /api/admin/subscriptions/[id]/cancel
// File Path: src/app/api/admin/subscriptions/[id]/cancel/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/subscription';
import User from '@/models/user';
import Stripe from 'stripe';

export async function POST(request, { params }) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get subscription ID from params
    const { id } = params;
    
    // Find subscription in database
    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Cancel subscription in Stripe (at period end)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update subscription in database
    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    await subscription.save();
    
    // Update user subscription status
    const user = await User.findById(subscription.userId);
    if (user) {
      // Don't change the status immediately since it's still active until the end of the period
      // Just mark it as to be canceled
      await User.findByIdAndUpdate(subscription.userId, {
        $set: { subscriptionEnd: subscription.currentPeriodEnd }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      subscription: {
        id: subscription._id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
    
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
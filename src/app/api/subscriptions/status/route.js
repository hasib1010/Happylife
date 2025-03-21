// src/app/api/subscriptions/status/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerUser } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Get the authenticated user
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get subscription model
    const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', mongoose.Schema);
    
    // Find user's subscription
    const subscription = await Subscription.findOne({ user: user._id });
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          hasSubscription: false,
          subscriptionStatus: 'none',
        }
      });
    }
    
    // Calculate days until renewal
    const today = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    const daysUntilRenewal = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    return NextResponse.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          status: subscription.status,
          plan: subscription.plan,
          autoRenew: subscription.autoRenew,
          currentPeriodEnd: subscription.currentPeriodEnd,
          daysUntilRenewal: daysUntilRenewal,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          renewalCount: subscription.renewalCount || 0,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

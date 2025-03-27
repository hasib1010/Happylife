// src/app/api/subscription/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Subscription from '@/models/subscription';
import { authOptions } from '@/lib/auth';

export async function GET() {
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
    
    // Get subscription data
    const subscription = await Subscription.findOne({
      userId: user._id,
    }).sort({ createdAt: -1 }); // Get the most recent subscription
    
    // Check if subscription is active
    const isActive = user.isSubscribed && 
                     (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') &&
                     new Date(user.subscriptionEnd) > new Date();
    
    return NextResponse.json({
      success: true,
      isActive,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      } : null,
      user: {
        isSubscribed: user.isSubscribed,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
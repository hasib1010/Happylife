// src/app/api/refresh-subscription/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find subscription
    const subscription = await Subscription.findOne({ user: user._id });
    
    if (subscription && subscription.status === 'active') {
      // Update user subscription status if it doesn't match
      if (user.subscriptionStatus !== 'active' || user.accountType !== subscription.plan) {
        user.subscriptionStatus = 'active';
        user.accountType = subscription.plan;
        user.subscriptionId = subscription._id;
        await user.save();
        
        console.log(`Updated user ${user._id} subscription status to active`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Subscription status updated',
        data: {
          subscriptionStatus: 'active',
          accountType: subscription.plan
        }
      });
    } else {
      // No active subscription found or status not active
      if (user.subscriptionStatus === 'active' && (!subscription || subscription.status !== 'active')) {
        // Fix inconsistency
        user.subscriptionStatus = 'none';
        user.accountType = 'regular';
        await user.save();
        
        console.log(`Fixed inconsistency for user ${user._id}`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'No active subscription found',
        data: {
          subscriptionStatus: user.subscriptionStatus,
          accountType: user.accountType
        }
      });
    }
  } catch (error) {
    console.error('Error refreshing subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
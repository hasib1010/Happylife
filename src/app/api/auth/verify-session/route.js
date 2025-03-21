// src/app/api/auth/verify-session/route.js
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-utils';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Get the currently authenticated user using our fixed function
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No valid session found' },
        { status: 401 }
      );
    }
    
    // If user has a subscription, get the latest status
    if (user.subscriptionStatus === 'active') {
      try {
        await connectToDatabase();
        
        // Get subscription model
        const Subscription = mongoose.models.Subscription || 
          mongoose.model('Subscription', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            status: String,
            plan: String,
            currentPeriodEnd: Date,
            autoRenew: Boolean,
          }));
        
        // Get latest subscription info
        const subscription = await Subscription.findOne({ user: user._id });
        
        if (subscription && subscription.status !== 'active') {
          // Update user's subscription status if it changed
          user.subscriptionStatus = subscription.status;
          await user.save();
        }
      } catch (subError) {
        console.error('Error checking subscription status:', subError);
      }
    }
    
    // Return sanitized user object (remove sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying session' },
      { status: 500 }
    );
  }
}
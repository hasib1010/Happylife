// src/app/api/subscriptions/verify/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    // Get the session ID from the URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'No session ID provided' },
        { status: 400 }
      );
    }
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get models
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      accountType: String,
      subscriptionStatus: String,
      subscriptionId: mongoose.Schema.Types.ObjectId,
    }, { strict: false });
    
    const SubscriptionSchema = new mongoose.Schema({
      user: mongoose.Schema.Types.ObjectId,
      plan: String,
      status: String,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    }, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
    
    // If the session has a subscription, verify it exists in our database
    if (session.subscription) {
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: session.subscription
      });
      
      if (!subscription) {
        // In case webhook hasn't processed yet, create a basic record
        // This is a fallback if the webhook failed or is delayed
        if (session.customer && session.metadata && session.metadata.userId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
          
          const newSubscription = new Subscription({
            user: new mongoose.Types.ObjectId(session.metadata.userId),
            plan: session.metadata.accountType || 'provider',
            status: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            autoRenew: !stripeSubscription.cancel_at_period_end,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          const result = await newSubscription.save();
          
          // Update user with subscription details
          await User.findByIdAndUpdate(
            session.metadata.userId,
            {
              accountType: session.metadata.accountType || 'provider',
              subscriptionStatus: 'active',
              subscriptionId: result._id,
            }
          );
          
          return NextResponse.json({
            success: true,
            message: 'Subscription created (fallback)',
            data: {
              status: 'active',
              accountType: session.metadata.accountType || 'provider'
            }
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Subscription not found in database' },
          { status: 404 }
        );
      }
      
      // Find the user associated with this subscription
      const user = await User.findById(subscription.user);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: {
          status: subscription.status,
          accountType: user.accountType,
          plan: subscription.plan
        }
      });
    } else if (session.payment_status === 'paid') {
      // For one-time payments without a subscription
      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          paymentStatus: session.payment_status
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No subscription found in session'
      });
    }
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying subscription' },
      { status: 500 }
    );
  }
}
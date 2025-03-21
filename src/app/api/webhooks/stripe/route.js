// src/app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    
    // Get models
    const User = mongoose.models.User || mongoose.model('User', mongoose.Schema);
    const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', mongoose.Schema);

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const { userId, accountType } = subscription.metadata;
        
        // Create subscription document
        const newSubscription = new Subscription({
          user: new ObjectId(userId),
          plan: accountType,
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          autoRenew: true, // Auto-renewal is enabled by default
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        const result = await newSubscription.save();
        
        // Update user with subscription details
        await User.findByIdAndUpdate(userId, {
          accountType,
          subscriptionStatus: 'active',
          subscriptionId: result._id,
        });
        
        console.log(`Subscription created for user ${userId}`);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Only update for recurring payments, not the initial one
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          
          // Update subscription document
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            { 
              status: 'active',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date(),
              autoRenew: !subscription.cancel_at_period_end,
              // Update lastPaymentDate when payment succeeds
              lastPaymentDate: new Date(),
              // Increment renewal count
              $inc: { renewalCount: 1 }
            }
          );
          
          // Find the subscription to get the user ID
          const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
          
          if (sub) {
            // Update user status as well
            await User.findByIdAndUpdate(sub.user, {
              subscriptionStatus: 'active'
            });
            
            console.log(`Subscription renewed for user ${sub.user}`);
          }
        }
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Find the subscription to get user details
        const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
        
        if (sub) {
          // Update subscription status
          await Subscription.findByIdAndUpdate(sub._id, { 
            status: 'past_due',
            updatedAt: new Date(),
            lastFailedPaymentDate: new Date()
          });
          
          // Update user subscription status
          await User.findByIdAndUpdate(sub.user, {
            subscriptionStatus: 'past_due'
          });
          
          console.log(`Payment failed for subscription ${invoice.subscription}`);
          
          // Optional: Notify the user about payment failure
          // await sendPaymentFailureEmail(sub.user);
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription in database
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { 
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            autoRenew: !subscription.cancel_at_period_end,
            updatedAt: new Date(),
          }
        );
        
        // Update user status
        const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
        
        if (sub) {
          await User.findByIdAndUpdate(sub.user, {
            subscriptionStatus: subscription.status
          });
          
          console.log(`Subscription updated for user ${sub.user}`);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription in database
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { 
            status: 'canceled',
            autoRenew: false,
            canceledAt: new Date(),
            updatedAt: new Date(),
          }
        );
        
        // Find the subscription to get user details
        const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
        
        if (sub) {
          // Update user subscription status
          await User.findByIdAndUpdate(sub.user, {
            subscriptionStatus: 'none',
            accountType: 'regular',
          });
          
          console.log(`Subscription canceled for user ${sub.user}`);
        }
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
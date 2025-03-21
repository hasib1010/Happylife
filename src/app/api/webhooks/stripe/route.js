// src/app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import { mapSubscriptionStatus } from '@/lib/stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { success: false, message: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { success: false, message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
  
  try {
    await connectDB();
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    return NextResponse.json(
      { success: false, message: `Webhook handler error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * @param {Object} session - Stripe checkout session
 */
async function handleCheckoutSessionCompleted(session) {
  // Get user ID from metadata
  const userId = session.metadata?.userId;
  const accountType = session.metadata?.accountType;
  
  if (!userId) {
    console.error('No user ID found in session metadata');
    return;
  }
  
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }
  
  // Update user with checkout session data
  if (accountType) {
    if (accountType === 'provider') {
      user.role = 'provider';
      user.accountType = 'provider';
    } else if (accountType === 'product_seller') {
      user.role = 'product_seller';
      user.accountType = 'product_seller';
    }
  }
  
  // Set subscription status to active
  user.subscriptionStatus = 'active';
  
  // Update Stripe customer ID if not already set
  if (!user.stripeCustomerId && session.customer) {
    user.stripeCustomerId = session.customer;
  }
  
  // Save changes
  await user.save();
  
  console.log(`Subscription activated for user ${userId} as ${accountType}`);
}

/**
 * Handle customer.subscription.created or customer.subscription.updated events
 * @param {Object} subscription - Stripe subscription
 */
async function handleSubscriptionUpdated(subscription) {
  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  
  if (!user) {
    console.error(`User not found for customer: ${subscription.customer}`);
    return;
  }
  
  // Update subscription status
  user.subscriptionStatus = mapSubscriptionStatus(subscription.status);
  
  // If subscription has metadata with accountType, update user role
  if (subscription.metadata?.accountType) {
    const accountType = subscription.metadata.accountType;
    if (accountType === 'provider') {
      user.role = 'provider';
      user.accountType = 'provider';
    } else if (accountType === 'product_seller') {
      user.role = 'product_seller';
      user.accountType = 'product_seller';
    }
  }
  
  // Save changes
  await user.save();
  
  console.log(`Subscription updated for user ${user._id}: ${subscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 * @param {Object} subscription - Stripe subscription
 */
async function handleSubscriptionDeleted(subscription) {
  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  
  if (!user) {
    console.error(`User not found for customer: ${subscription.customer}`);
    return;
  }
  
  // Update subscription status
  user.subscriptionStatus = 'canceled';
  
  // Save changes
  await user.save();
  
  console.log(`Subscription canceled for user ${user._id}`);
}

/**
 * Handle invoice.payment_succeeded event
 * @param {Object} invoice - Stripe invoice
 */
async function handleInvoicePaymentSucceeded(invoice) {
  // Only handle subscription invoices
  if (invoice.billing_reason !== 'subscription_create' && 
      invoice.billing_reason !== 'subscription_cycle') {
    return;
  }
  
  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (!user) {
    console.error(`User not found for customer: ${invoice.customer}`);
    return;
  }
  
  // Update subscription status to active
  user.subscriptionStatus = 'active';
  
  // Save changes
  await user.save();
  
  console.log(`Payment succeeded for user ${user._id}`);
}

/**
 * Handle invoice.payment_failed event
 * @param {Object} invoice - Stripe invoice
 */
async function handleInvoicePaymentFailed(invoice) {
  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (!user) {
    console.error(`User not found for customer: ${invoice.customer}`);
    return;
  }
  
  // Update subscription status to past_due
  user.subscriptionStatus = 'past_due';
  
  // Save changes
  await user.save();
  
  console.log(`Payment failed for user ${user._id}`);
}

// OPTIONS method is required for handling CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
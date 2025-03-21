// src/app/api/subscriptions/create/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import mongoose from 'mongoose';
// Import the fixed getServerUser function
import { getServerUser } from '@/lib/auth-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

export async function POST(request) {
  try {
    // Use the fixed getServerUser function instead of the custom one
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { accountType } = await request.json();

    if (!accountType || (accountType !== 'provider' && accountType !== 'product_seller')) {
      return NextResponse.json(
        { message: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { message: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create checkout session for subscription with auto-renewal
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PRICE_ID, // $20/month price ID from Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        // Auto-renewal is the default for subscriptions
        metadata: {
          userId: user._id.toString(),
          accountType,
        },
         
      },
      // Store payment method for future recurring payments
      payment_method_collection: 'always',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscribe/cancel`,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: checkoutSession.url,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
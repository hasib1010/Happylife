// src/lib/stripe.js
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new customer in Stripe
export const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'HappyLife.Services',
      },
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
};

// Create a subscription for a customer
export const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionStatus: subscription.status,
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error('Failed to create subscription');
  }
};

// Create a checkout session for subscription
export const createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

// Get subscription details
export const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
};

// Cancel a subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    return canceledSubscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

// Update a subscription
export const updateSubscription = async (subscriptionId, updateData) => {
  try {
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId, 
      updateData
    );
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
};

// Create a portal session for managing subscriptions
export const createPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Failed to create portal session');
  }
};

// Verify and construct webhook event
export const constructEventFromPayload = async (signature, payload) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export default {
  createCustomer,
  createSubscription,
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  createPortalSession,
  constructEventFromPayload,
};
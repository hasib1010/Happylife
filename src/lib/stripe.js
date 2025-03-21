// src/lib/stripe.js
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Check if required environment variables are set
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
  console.warn('Missing Stripe API keys. Payment features will not work correctly.');
}

export default stripe;

// Helper functions for Stripe operations

/**
 * Create a Stripe Checkout session for subscription
 * @param {Object} options - Options for creating the checkout session
 * @returns {Promise<Object>} Stripe checkout session
 */
export const createCheckoutSession = async ({
  customerId,
  priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
  successUrl,
  cancelUrl,
  metadata = {}
}) => {
  try {
    // Create the checkout session
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
      metadata
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieve Stripe customer by ID
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Stripe customer
 */
export const getCustomer = async (customerId) => {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
};

/**
 * Create or retrieve a Stripe customer
 * @param {Object} customer - Customer information
 * @returns {Promise<Object>} Stripe customer
 */
export const createOrRetrieveCustomer = async ({ email, name, metadata = {} }) => {
  try {
    // First check if customer exists
    const customers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      name,
      metadata
    });
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
};

/**
 * Get subscription details for a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscriptionForCustomer = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method']
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

/**
 * Create a portal session for managing subscriptions
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - URL to return to after portal session
 * @returns {Promise<Object>} Portal session
 */
export const createPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Canceled subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Map subscription status to our internal status
 * @param {string} stripeStatus - Stripe subscription status
 * @returns {string} Internal subscription status
 */
export const mapSubscriptionStatus = (stripeStatus) => {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'unpaid': 'unpaid',
    'canceled': 'canceled',
    'incomplete': 'none',
    'incomplete_expired': 'none',
    'trialing': 'active',
    'paused': 'paused'
  };

  return statusMap[stripeStatus] || 'none';
};
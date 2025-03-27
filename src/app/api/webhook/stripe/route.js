// src/app/api/webhook/stripe/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Subscription from '@/models/subscription';
import Service from '@/models/service';
import Payment from '@/models/payment'; // Make sure you've created this model
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Get the Stripe signature from the request headers
    // Fix: Await the headers() function
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    // Parse the request body as text
    const body = await request.text();

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Process the event based on its type
    console.log(`Processing webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a successful response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    console.error(error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * This event is triggered when a customer completes the Stripe Checkout process
 */
async function handleCheckoutSessionCompleted(event) {
  try {
    const session = event.data.object;
    console.log("Processing checkout.session.completed");
    console.log("Session data:", JSON.stringify(session, null, 2));

    // Check if this is a feature service payment
    if (session.metadata?.type === 'service_feature') {
      console.log("This is a service feature payment. Metadata:", session.metadata);
      await handleFeaturePayment(session);
      console.log("Finished handling feature payment");
      return;
    } else {
      console.log("Not a service feature payment. Metadata:", session.metadata);
    }

    // Rest of the function remains the same
    // Check if this is a subscription checkout
    if (!session.subscription) {
      console.log('Checkout session does not include a subscription');
      return;
    }

    // Get user ID from metadata
    const userId = session.metadata?.userId;
    if (!userId) {
      console.log('No user ID found in checkout session metadata, trying to get from customer');

      // If userId not in metadata, try to get it from the customer
      if (session.customer) {
        try {
          const customer = await stripe.customers.retrieve(session.customer);
          const customerUserId = customer.metadata?.userId;

          if (customerUserId) {
            console.log(`Found userId ${customerUserId} in customer metadata`);
            // Update user with checkout session data
            await updateUserFromCheckout(customerUserId, session);
          } else {
            console.log('No user ID found in customer metadata');
          }
        } catch (err) {
          console.error('Error retrieving customer:', err);
        }
      }
      return;
    }

    // Update user with checkout session data
    await updateUserFromCheckout(userId, session);

  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    console.error(error.stack);
    throw error;
  }
}

/**
 * Handle feature service payment
 * This processes payments for featuring services
 */
async function handleFeaturePayment(session) {
  try {
    const { serviceId, userId } = session.metadata;
    
    // Set expiration to exactly 30 days from now
    const featureExpiration = new Date();
    featureExpiration.setDate(featureExpiration.getDate() + 30);

    console.log(`Processing feature payment for service ${serviceId}, user ${userId}`);
    console.log(`Setting feature expiration to: ${featureExpiration.toISOString()}`);

    // Use findByIdAndUpdate for atomic update with validation
    const updateResult = await Service.findByIdAndUpdate(
      serviceId,
      {
        $set: {
          isFeatured: true,
          featureExpiration: featureExpiration,
          lastPaymentId: session.payment_intent || session.id
        }
      },
      { new: true, runValidators: true }
    );

    if (!updateResult) {
      console.error(`Service not found with ID: ${serviceId}`);
      return;
    }

    console.log(`Service updated successfully:`, {
      id: updateResult._id,
      businessName: updateResult.businessName || updateResult.title,
      isFeatured: updateResult.isFeatured,
      featureExpiration: updateResult.featureExpiration
    });

    // Record the payment in your database if you have a Payment model
    try {
      await Payment.create({
        userId,
        serviceId,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total / 100, // Convert from cents to dollars
        currency: session.currency,
        type: 'feature',
        status: 'completed',
        metadata: {
          featureExpiration: featureExpiration
        }
      });
      console.log(`Payment record created for feature purchase`);
    } catch (paymentError) {
      // Don't fail the whole process if payment recording fails
      console.error(`Error recording payment:`, paymentError);
    }
    
    return updateResult;
  } catch (error) {
    console.error(`Error processing feature payment:`, error);
    throw error; // Re-throw to ensure the webhook knows there was an error
  }
}

/**
 * Update user data from checkout session
 */
async function updateUserFromCheckout(userId, session) {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    console.log(`Processing checkout for user ${userId}, name: ${user.name}`);

    // Update user with Stripe customer ID if not already set
    if (!user.stripeCustomerId && session.customer) {
      user.stripeCustomerId = session.customer;
    }

    // If there's a subscription, update subscription information
    if (session.subscription) {
      user.stripeSubscriptionId = session.subscription;
      user.isSubscribed = true;

      // Fetch subscription details from Stripe
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        user.subscriptionStatus = subscription.status;
        user.subscriptionStart = new Date(subscription.current_period_start * 1000);
        user.subscriptionEnd = new Date(subscription.current_period_end * 1000);

        console.log(`Updated user subscription status to ${subscription.status}`);
      } catch (err) {
        console.error('Error retrieving subscription:', err);
      }
    }

    // Save user changes
    await user.save();
    console.log(`User ${userId} updated successfully from checkout session`);
  } catch (err) {
    console.error(`Error updating user from checkout: ${err.message}`);
  }
}

/**
 * Handle customer.subscription.created event
 * This event is triggered when a new subscription is created
 */
async function handleSubscriptionCreated(event) {
  try {
    const subscription = event.data.object;
    console.log(`Processing subscription.created for subscription ${subscription.id}`);

    // Retrieve the customer to get the user ID from metadata
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata?.userId;

    if (!userId) {
      console.log('No user ID found in customer metadata');
      return;
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (existingSubscription) {
      console.log(`Subscription already exists in database: ${subscription.id}`);

      // Update existing subscription
      existingSubscription.status = subscription.status;
      existingSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      existingSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      existingSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

      await existingSubscription.save();
      console.log('Existing subscription updated');
    } else {
      // Create a new subscription record
      const newSubscription = new Subscription({
        userId: user._id,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      await newSubscription.save();
      console.log('New subscription record created');
    }

    // Update the user's subscription information
    user.isSubscribed = true;
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = subscription.status;
    user.subscriptionPlan = 'standard'; // Only one plan for now
    user.subscriptionStart = new Date(subscription.current_period_start * 1000);
    user.subscriptionEnd = new Date(subscription.current_period_end * 1000);

    await user.save();

    console.log(`User ${userId} subscription info updated: status=${subscription.status}, isSubscribed=true`);
  } catch (error) {
    console.error('Error handling customer.subscription.created:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 * This event is triggered when a subscription is updated (e.g., plan change, renewal)
 */
async function handleSubscriptionUpdated(event) {
  try {
    const subscription = event.data.object;
    console.log(`Processing subscription.updated for subscription ${subscription.id}`);

    // Find the subscription in our database
    let dbSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id,
    });

    let userId = null;

    if (dbSubscription) {
      console.log(`Found subscription in database with userId: ${dbSubscription.userId}`);
      userId = dbSubscription.userId;

      // Update subscription details
      dbSubscription.status = subscription.status;
      dbSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      dbSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      dbSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

      if (subscription.canceled_at) {
        dbSubscription.canceledAt = new Date(subscription.canceled_at * 1000);
      }

      await dbSubscription.save();
      console.log('Subscription record updated');
    } else {
      console.log('Subscription not found in database, trying to find user by customer ID');

      // Try to find the user by Stripe customer ID
      const user = await User.findOne({
        stripeCustomerId: subscription.customer,
      });

      if (user) {
        console.log(`Found user by customer ID: ${user._id}`);
        userId = user._id;

        // Create a new subscription record
        const newSubscription = new Subscription({
          userId: user._id,
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        await newSubscription.save();
        console.log('New subscription record created');
      } else {
        console.log('No user found with this customer ID, trying to get from Stripe customer');

        // Try to get customer data from Stripe
        try {
          const customer = await stripe.customers.retrieve(subscription.customer);
          const customerUserId = customer.metadata?.userId;

          if (customerUserId) {
            console.log(`Found userId ${customerUserId} in customer metadata`);
            userId = customerUserId;

            // Create a new subscription record
            const newSubscription = new Subscription({
              userId: customerUserId,
              stripeCustomerId: subscription.customer,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });

            await newSubscription.save();
            console.log('New subscription record created from customer metadata');
          } else {
            console.log('No user ID found in customer metadata');
            return;
          }
        } catch (err) {
          console.error('Error retrieving customer from Stripe:', err);
          return;
        }
      }
    }

    // If we have a userId, update the user record
    if (userId) {
      const user = await User.findById(userId);

      if (user) {
        user.subscriptionStatus = subscription.status;
        user.subscriptionEnd = new Date(subscription.current_period_end * 1000);

        // Check if subscription is active
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          user.isSubscribed = true;
          console.log(`Setting user ${userId} as subscribed`);
        } else {
          user.isSubscribed = false;
          console.log(`Setting user ${userId} as NOT subscribed`);
        }

        await user.save();
        console.log(`User ${userId} subscription status updated to ${subscription.status}, isSubscribed=${user.isSubscribed}`);
      } else {
        console.log(`User not found with ID: ${userId}`);
      }
    }

    console.log(`Subscription updated for ID ${subscription.id}`);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    console.error(error.stack);
  }
}

/**
 * Handle customer.subscription.deleted event
 * This event is triggered when a subscription is canceled or expires
 */
async function handleSubscriptionDeleted(event) {
  try {
    const subscription = event.data.object;
    console.log(`Processing subscription.deleted for subscription ${subscription.id}`);

    // Find the subscription in our database
    const dbSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id,
    });

    if (!dbSubscription) {
      console.log(`No subscription found with ID: ${subscription.id}`);

      // Try to find user by subscription ID in user model
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });

      if (user) {
        console.log(`Found user with subscription ID in user model: ${user._id}`);
        user.isSubscribed = false;
        user.subscriptionStatus = 'canceled';
        await user.save();
        console.log(`User subscription status updated to canceled`);
      }

      return;
    }

    // Update subscription
    dbSubscription.status = 'canceled';
    dbSubscription.canceledAt = new Date();

    await dbSubscription.save();
    console.log('Subscription marked as canceled');

    // Update user's subscription status
    const user = await User.findById(dbSubscription.userId);

    if (user) {
      user.isSubscribed = false;
      user.subscriptionStatus = 'canceled';

      await user.save();
      console.log(`User ${dbSubscription.userId} subscription status updated to canceled`);
    } else {
      console.log(`User not found with ID: ${dbSubscription.userId}`);
    }

    console.log(`Subscription deleted for ID ${subscription.id}`);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    console.error(error.stack);
  }
}

/**
 * Handle invoice.payment_succeeded event
 * This event is triggered when a payment succeeds
 */
async function handleInvoicePaymentSucceeded(event) {
  try {
    const invoice = event.data.object;
    console.log(`Processing invoice.payment_succeeded for invoice ${invoice.id}`);

    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice');
      return;
    }

    // Find the subscription in our database
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (subscription) {
      console.log(`Found subscription record: ${subscription._id}`);

      // Update subscription status
      subscription.status = 'active';
      await subscription.save();
      console.log('Subscription status updated to active');

      // Update user
      const user = await User.findById(subscription.userId);

      if (user) {
        user.isSubscribed = true;
        user.subscriptionStatus = 'active';

        await user.save();
        console.log(`User ${subscription.userId} marked as subscribed with active status`);
      } else {
        console.log(`User not found with ID: ${subscription.userId}`);
      }
    } else {
      console.log(`No subscription found with ID: ${invoice.subscription}`);

      // Try to find user by subscription ID in user model
      const user = await User.findOne({ stripeSubscriptionId: invoice.subscription });

      if (user) {
        console.log(`Found user with subscription ID in user model: ${user._id}`);
        user.isSubscribed = true;
        user.subscriptionStatus = 'active';
        await user.save();
        console.log(`User marked as subscribed with active status`);
      } else if (invoice.customer) {
        // Try to find user by customer ID
        const customerUser = await User.findOne({ stripeCustomerId: invoice.customer });

        if (customerUser) {
          console.log(`Found user by customer ID: ${customerUser._id}`);
          customerUser.isSubscribed = true;
          customerUser.subscriptionStatus = 'active';
          customerUser.stripeSubscriptionId = invoice.subscription;
          await customerUser.save();
          console.log(`User marked as subscribed with active status`);

          // Create subscription record
          const newSubscription = new Subscription({
            userId: customerUser._id,
            stripeCustomerId: invoice.customer,
            stripeSubscriptionId: invoice.subscription,
            status: 'active',
            // Fetch subscription details from Stripe for dates
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
          });

          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
            newSubscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
            newSubscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
            newSubscription.stripePriceId = stripeSubscription.items.data[0].price.id;
          } catch (err) {
            console.error('Error fetching subscription details:', err);
          }

          await newSubscription.save();
          console.log('Created new subscription record');
        }
      }
    }

    console.log(`Payment succeeded for subscription ${invoice.subscription}`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    console.error(error.stack);
  }
}

/**
 * Handle invoice.payment_failed event
 * This event is triggered when a payment fails
 */
async function handleInvoicePaymentFailed(event) {
  try {
    const invoice = event.data.object;
    console.log(`Processing invoice.payment_failed for invoice ${invoice.id}`);

    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice');
      return;
    }

    // Find the subscription in our database
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (subscription) {
      console.log(`Found subscription: ${subscription._id}`);

      // Update subscription status
      subscription.status = 'past_due';
      await subscription.save();
      console.log('Subscription status updated to past_due');

      // Update user
      const user = await User.findById(subscription.userId);

      if (user) {
        user.subscriptionStatus = 'past_due';
        await user.save();
        console.log(`User ${subscription.userId} subscription status updated to past_due`);
      } else {
        console.log(`User not found with ID: ${subscription.userId}`);
      }
    } else {
      console.log(`No subscription found with ID: ${invoice.subscription}`);

      // Try to find user by subscription ID
      const user = await User.findOne({ stripeSubscriptionId: invoice.subscription });

      if (user) {
        console.log(`Found user with subscription ID: ${user._id}`);
        user.subscriptionStatus = 'past_due';
        await user.save();
        console.log(`User subscription status updated to past_due`);
      }
    }

    console.log(`Payment failed for subscription ${invoice.subscription}`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    console.error(error.stack);
  }
}
// src/app/api/stripe/create-feature-checkout/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();

    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { serviceId } = await request.json();
    
    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Verify the service exists and belongs to the user
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    if (service.providerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to feature this service' }, { status: 403 });
    }

    // Check if already featured and not expired
    const isCurrentlyFeatured = service.isFeatured && 
                               service.featureExpiration && 
                               new Date(service.featureExpiration) > new Date();
                               
    if (isCurrentlyFeatured) {
      return NextResponse.json({ 
        error: 'Service is already featured', 
        featureExpiration: service.featureExpiration 
      }, { status: 400 });
    }

    // Get service name (using businessName or title for backward compatibility)
    const serviceName = service.businessName || service.title;
    
    // Get service image (logo or first image in images array)
    const serviceImage = service.logo || 
                        (service.images && service.images.length > 0 ? service.images[0] : null);

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Feature Listing - 30 Days',
              description: `Feature your listing "${serviceName}" for 30 days`,
              images: serviceImage ? [serviceImage] : undefined,
            },
            unit_amount: 1000, // $10 in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        serviceId: service._id.toString(),
        userId: session.user.id,
        type: 'service_feature',
      },
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/dashboard/services?feature_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/dashboard/services?feature_canceled=true`,
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    );
  }
}
// src/app/api/stripe/create-feature-product-checkout/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

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
    const { productId, duration = 30 } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify the product exists and belongs to the user
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to feature this product' }, { status: 403 });
    }

    // Check if already featured and not expired
    const isCurrentlyFeatured = product.isFeatured && 
                               product.featureExpiration && 
                               new Date(product.featureExpiration) > new Date();
                               
    if (isCurrentlyFeatured) {
      return NextResponse.json({ 
        error: 'Product is already featured', 
        featureExpiration: product.featureExpiration 
      }, { status: 400 });
    }

    // Get product name
    const productName = product.title;
    
    // Get product image (first image in images array)
    const productImage = product.images && product.images.length > 0 ? product.images[0] : null;

    // Set price based on selected duration (fixed at $9.99 for 30 days)
    const priceInCents = 999;  // $9.99 in cents

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Feature Product - ${duration} Days`,
              description: `Feature your product "${productName}" for ${duration} days`,
              images: productImage ? [productImage] : undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product._id.toString(),
        userId: session.user.id,
        type: 'product_feature',
        duration: duration.toString()
      },
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/dashboard/products?feature_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/dashboard/products?feature_canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating feature product checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    );
  }
}
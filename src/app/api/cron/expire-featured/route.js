// src/app/api/cron/expire-featured/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import Service from '@/models/service';

export async function GET(request) {
  try {
    // Check for secret token to ensure the request is authorized
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const now = new Date();
    
    // Find and update all expired featured products
    const productResult = await Product.updateMany(
      { 
        isFeatured: true,
        featureExpiration: { $lt: now }
      },
      {
        $set: { isFeatured: false }
      }
    );
    
    // Find and update all expired featured services
    const serviceResult = await Service.updateMany(
      { 
        isFeatured: true,
        featureExpiration: { $lt: now }
      },
      {
        $set: { isFeatured: false }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Updated ${productResult.modifiedCount} products and ${serviceResult.modifiedCount} services with expired featured status`,
      stats: {
        products: {
          matched: productResult.matchedCount,
          modified: productResult.modifiedCount
        },
        services: {
          matched: serviceResult.matchedCount,
          modified: serviceResult.modifiedCount
        }
      }
    });
  } catch (error) {
    console.error('Error expiring featured items:', error);
    return NextResponse.json(
      { 
        error: 'Failed to expire featured items',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
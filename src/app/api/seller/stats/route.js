// src/app/api/seller/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Product from '@/models/product';
import Payment from '@/models/payment';

export async function GET(request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'You must be signed in to access this resource' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Find the user and verify they are a seller
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'seller') {
      return NextResponse.json(
        { success: false, message: 'Access denied: User is not a seller' },
        { status: 403 }
      );
    }
    
    // Collect seller-specific stats
    // 1. Get product listings count
    const productCount = await Product.countDocuments({ 
      sellerId: userId,
      status: 'published',
      isActive: true
    });
    
    // 2. Get total views across all products
    const viewsAggregation = await Product.aggregate([
      { $match: { sellerId: userId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
    
    // 3. Count orders (completed payments for products)
    // This is a placeholder - you should adjust based on your actual data structure
    const orderCount = await Payment.countDocuments({
      userId,
      type: 'product_feature',
      status: 'completed'
    });
    
    // 4. Count total reviews across products
    // This is a placeholder - adjust based on your actual data structure for reviews
    const reviewCount = 0; // Replace with actual query when you have a reviews model
    
    // 5. Calculate revenue if applicable
    const revenueAggregation = await Payment.aggregate([
      { 
        $match: { 
          userId, 
          type: 'product_feature',
          status: 'completed'
        } 
      },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    
    // Compile all stats
    const stats = {
      listings: productCount,
      views: totalViews,
      orders: orderCount,
      reviews: reviewCount,
      revenue: totalRevenue,
      // Add any other relevant seller metrics
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch seller statistics',
        error: error.message
      },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/products/analytics
// File Path: src/app/api/admin/products/analytics/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

export async function GET(request) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse query parameters (for timeframe)
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30'; // Default to 30 days
    
    // Calculate date for filtering by timeframe
    const timeframeDate = new Date();
    timeframeDate.setDate(timeframeDate.getDate() - parseInt(timeframe));
    
    // Get total count of products
    const totalProducts = await Product.countDocuments();
    
    // Count by status
    const publishedCount = await Product.countDocuments({ status: 'published' });
    const draftCount = await Product.countDocuments({ status: 'draft' });
    const suspendedCount = await Product.countDocuments({ status: 'suspended' });
    
    // Count by category
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Count featured products
    const featuredCount = await Product.countDocuments({ isFeatured: true });
    
    // Get recently added products (last timeframe days)
    const recentlyAdded = await Product.countDocuments({
      createdAt: { $gte: timeframeDate }
    });
    
    // Get top viewed products
    const topViewed = await Product.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title viewCount price discountPrice');
    
    // Calculate average discount percentage for products on sale
    const discountStats = await Product.aggregate([
      { $match: { discountPrice: { $gt: 0, $lt: '$price' } } },
      { $group: {
          _id: null,
          avgDiscountPercentage: { 
            $avg: { 
              $multiply: [
                { $divide: [
                  { $subtract: ['$price', '$discountPrice'] }, 
                  '$price'
                ] }, 
                100
              ] 
            } 
          },
          totalDiscounted: { $sum: 1 }
        }
      }
    ]);
    
    let avgDiscountPercentage = 0;
    let totalDiscounted = 0;
    
    if (discountStats.length > 0) {
      avgDiscountPercentage = discountStats[0].avgDiscountPercentage;
      totalDiscounted = discountStats[0].totalDiscounted;
    }
    
    // Get price distribution
    const priceRanges = [
      { min: 0, max: 10 },
      { min: 10, max: 25 },
      { min: 25, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 1000000 }
    ];
    
    const priceDistribution = await Promise.all(
      priceRanges.map(async ({ min, max }) => {
        const count = await Product.countDocuments({
          price: { $gte: min, $lt: max }
        });
        
        return {
          range: max === 1000000 ? `$${min}+` : `$${min} - $${max}`,
          count
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalProducts,
        statusCounts: {
          published: publishedCount,
          draft: draftCount,
          suspended: suspendedCount
        },
        categoryCounts,
        featuredCount,
        recentlyAdded,
        topViewed,
        discountStats: {
          avgDiscountPercentage: parseFloat(avgDiscountPercentage.toFixed(2)),
          totalDiscounted
        },
        priceDistribution
      }
    });
    
  } catch (error) {
    console.error('Error generating product analytics:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/services/analytics
// File Path: src/app/api/admin/services/analytics/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

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
    
    // Get total count of services
    const totalServices = await Service.countDocuments();
    
    // Count by status
    const publishedCount = await Service.countDocuments({ status: 'published' });
    const draftCount = await Service.countDocuments({ status: 'draft' });
    const suspendedCount = await Service.countDocuments({ status: 'suspended' });
    
    // Count by category
    const categoryCounts = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Count featured services
    const featuredCount = await Service.countDocuments({ 
      isFeatured: true,
      featureExpiration: { $gt: new Date() }
    });
    
    // Get recently added services (last 30 days)
    const recentlyAdded = await Service.countDocuments({
      createdAt: { $gte: timeframeDate }
    });
    
    // Get top viewed services
    const topViewed = await Service.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('businessName viewCount');
    
    // Get subscriptions by status
    const subscriptionStats = await Service.aggregate([
      { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Calculate average click-through rate
    const ctrData = await Service.aggregate([
      { $match: { viewCount: { $gt: 0 } } }, // Only services with views
      { $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalClicks: { $sum: '$clickCount' }
        }
      }
    ]);
    
    let averageCTR = 0;
    if (ctrData.length > 0 && ctrData[0].totalViews > 0) {
      averageCTR = (ctrData[0].totalClicks / ctrData[0].totalViews) * 100;
    }
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalServices,
        statusCounts: {
          published: publishedCount,
          draft: draftCount,
          suspended: suspendedCount
        },
        categoryCounts,
        featuredCount,
        recentlyAdded,
        topViewed,
        subscriptionStats,
        averageCTR: parseFloat(averageCTR.toFixed(2))
      }
    });
    
  } catch (error) {
    console.error('Error generating service analytics:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
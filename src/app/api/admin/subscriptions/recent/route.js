// API Path: /api/admin/subscriptions/recent
// File Path: src/app/api/admin/subscriptions/recent/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';

// Get recent subscription data for admin dashboard
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
    
    // Get query parameters (optional)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10; // Default to 10 recent subscriptions
    
    // Calculate date for recent filter (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find recent subscriptions (both active and recent changes)
    const recentSubscriptions = await User.find({
      $or: [
        // Users with active subscriptions
        { isSubscribed: true, subscriptionStatus: { $in: ['active', 'trialing'] } },
        // Users with recent subscription updates
        { 
          $or: [
            { updatedAt: { $gte: thirtyDaysAgo } },
            { subscriptionStart: { $gte: thirtyDaysAgo } }
          ],
          subscriptionStatus: { $ne: null }
        }
      ]
    })
    .select('name email profilePicture businessName role isSubscribed subscriptionStatus subscriptionPlan subscriptionStart subscriptionEnd updatedAt')
    .sort({ updatedAt: -1 })
    .limit(limit);
    
    // Get subscription stats
    const activeSubscriptions = await User.countDocuments({ 
      isSubscribed: true, 
      subscriptionStatus: { $in: ['active', 'trialing'] } 
    });
    
    const expiredSubscriptions = await User.countDocuments({ 
      subscriptionStatus: 'canceled',
      subscriptionEnd: { $lt: new Date() }
    });
    
    const trialSubscriptions = await User.countDocuments({ 
      subscriptionStatus: 'trialing' 
    });
    
    // Count subscriptions by plan
    const subscriptionsByPlan = await User.aggregate([
      { 
        $match: { 
          isSubscribed: true,
          subscriptionStatus: { $in: ['active', 'trialing'] },
          subscriptionPlan: { $ne: null }
        } 
      },
      { 
        $group: { 
          _id: '$subscriptionPlan', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent revenue (this would typically come from your payment provider's API)
    // This is a placeholder - you should replace with actual revenue data
    const revenueStats = {
      monthly: 0,
      annual: 0,
      total: 0,
      growth: 0
    };
    
    return NextResponse.json({
      success: true,
      recentSubscriptions,
      stats: {
        activeSubscriptions,
        expiredSubscriptions,
        trialSubscriptions,
        subscriptionsByPlan,
        revenue: revenueStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching recent subscriptions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
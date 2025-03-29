// API Path: /api/admin/stats
// File Path: src/app/api/admin/stats/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Service from '@/models/service';
import Product from '@/models/product';
import Subscription from '@/models/subscription';
import Payment from '@/models/payment';

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
    
    // Get basic stats
    const [
      totalUsers,
      totalProviders,
      totalSellers,
      totalServices,
      totalProducts,
      activeSubscriptions,
      newUsersThisMonth,
      totalRevenue
    ] = await Promise.all([
      // Count all users
      User.countDocuments({}),
      
      // Count providers
      User.countDocuments({ role: 'provider' }),
      
      // Count sellers
      User.countDocuments({ role: 'seller' }),
      
      // Count services
      Service.countDocuments({}),
      
      // Count products
      Product.countDocuments({}),
      
      // Count active subscriptions
      Subscription.countDocuments({ 
        status: { $in: ['active', 'trialing'] },
        currentPeriodEnd: { $gt: new Date() }
      }),
      
      // Count new users this month
      User.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setDate(1)) // First day of current month
        }
      }),
      
      // Calculate total revenue
      Payment.aggregate([
        { 
          $match: { 
            status: 'completed' 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' } 
          } 
        }
      ]).then(result => (result.length > 0 ? result[0].total : 0))
    ]);
    
    // Get monthly growth data (for the last 6 months)
    const monthlyUserGrowth = await getMonthlyUserGrowth(6);
    const monthlyRevenue = await getMonthlyRevenue(6);
    
    return NextResponse.json({
      success: true,
      totalUsers,
      totalProviders,
      totalSellers,
      totalRegularUsers: totalUsers - totalProviders - totalSellers,
      totalServices,
      totalProducts,
      activeSubscriptions,
      newUsersThisMonth,
      totalRevenue,
      monthlyUserGrowth,
      monthlyRevenue
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get monthly user growth
async function getMonthlyUserGrowth(numMonths) {
  const monthlyData = [];
  const today = new Date();
  
  for (let i = 0; i < numMonths; i++) {
    // Calculate the start and end dates for each month
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    
    // Count users created in this month
    const count = await User.countDocuments({
      createdAt: { 
        $gte: monthStart,
        $lte: monthEnd
      }
    });
    
    // Format the month name
    const monthName = monthStart.toLocaleString('default', { month: 'short' });
    
    monthlyData.unshift({
      month: monthName,
      count
    });
  }
  
  return monthlyData;
}

// Helper function to get monthly revenue
async function getMonthlyRevenue(numMonths) {
  const monthlyData = [];
  const today = new Date();
  
  for (let i = 0; i < numMonths; i++) {
    // Calculate the start and end dates for each month
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    
    // Calculate revenue for this month
    const revenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: monthStart,
            $lte: monthEnd
          }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]).then(result => (result.length > 0 ? result[0].total : 0));
    
    // Format the month name
    const monthName = monthStart.toLocaleString('default', { month: 'short' });
    
    monthlyData.unshift({
      month: monthName,
      revenue
    });
  }
  
  return monthlyData;
}
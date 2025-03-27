// src/app/api/user/dashboard/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Service from '@/models/service';
import Product from '@/models/product';

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
    
    // Find the user with relevant data
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get basic user stats based on their role
    let stats = {};
    
    if (user.role === 'provider') {
      // For providers, get service listings count and total views
      const serviceCount = await Service.countDocuments({ providerId: userId });
      
      // Aggregate total views across all services
      const viewsAggregation = await Service.aggregate([
        { $match: { providerId: userId } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]);
      
      const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
      
      stats = {
        listings: serviceCount,
        views: totalViews
      };
    } else if (user.role === 'seller') {
      // For sellers, get product listings count and total views
      const productCount = await Product.countDocuments({ sellerId: userId });
      
      // Aggregate total views across all products
      const viewsAggregation = await Product.aggregate([
        { $match: { sellerId: userId } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]);
      
      const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
      
      stats = {
        listings: productCount,
        views: totalViews
      };
    }
    
    // Format the user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isSubscribed: user.isSubscribed || false,
      subscription: user.subscription || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Return user data and stats
    return NextResponse.json({
      success: true,
      user: userData,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch user dashboard data',
        error: error.message
      },
      { status: 500 }
    );
  }
}
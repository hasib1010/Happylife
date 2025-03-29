// src/app/api/provider/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Service from '@/models/service';
import Comment from '@/models/comment';
import Blog from '@/models/blog';

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
    
    // Find the user and verify they are a provider
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Access denied: User is not a provider' },
        { status: 403 }
      );
    }
    
    // Collect provider-specific stats
    // 1. Get service listings count
    const serviceCount = await Service.countDocuments({ 
      providerId: userId,
      status: 'published',
      isActive: true
    });
    
    // 2. Get total views across all services
    const viewsAggregation = await Service.aggregate([
      { $match: { providerId: userId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
    
    // 3. Count inquiries (can be implemented based on your actual data model)
    // This is a placeholder - you should adjust based on your actual data structure
    const inquiryCount = 0; // Replace with actual query
    
    // 4. Count total reviews across services
    // This is a placeholder - adjust based on your actual data structure for reviews
    const reviewCount = 0; // Replace with actual query
    
    // 5. Get blog post stats if provider has published blogs
    const blogCount = await Blog.countDocuments({ 
      authorId: userId,
      status: 'published'
    });
    
    const blogViews = await Blog.aggregate([
      { $match: { authorId: userId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const totalBlogViews = blogViews.length > 0 ? blogViews[0].totalViews : 0;
    
    // Compile all stats
    const stats = {
      listings: serviceCount,
      views: totalViews,
      inquiries: inquiryCount,
      reviews: reviewCount,
      blogs: blogCount,
      blogViews: totalBlogViews,
      // Add any other relevant provider metrics
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch provider statistics',
        error: error.message
      },
      { status: 500 }
    );
  }
}
// src/app/api/blogs/[id]/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Update blog status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the blog
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (blog.authorId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You are not authorized to update this blog' },
        { status: 403 }
      );
    }

    // Check if user has an active subscription
    if (!user.hasActiveSubscription()) {
      return NextResponse.json(
        { error: 'Active subscription required to update blog status' },
        { status: 403 }
      );
    }

    // Parse request data
    const { status } = await request.json();
    
    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Handle status change
    const wasPublished = blog.status === 'published';
    blog.status = status;
    
    // If publishing for the first time, set published date
    if (!wasPublished && status === 'published') {
      blog.publishedAt = new Date();
    }

    // Save updated blog
    await blog.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Blog status updated successfully',
      blog 
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog status' },
      { status: 500 }
    );
  }
}
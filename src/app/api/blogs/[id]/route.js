// src/app/api/blogs/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a single blog by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Connect to database
    await connectDB();

    // Find the blog
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // For draft blogs, check if requester is the author
    if (blog.status === 'draft') {
      const session = await getServerSession(authOptions);
      
      // If not logged in, can't view drafts
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user
      const user = await User.findOne({ email: session.user.email });
      
      // Only the author can view their drafts
      if (!user || blog.authorId.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Unauthorized to view this draft' },
          { status: 403 }
        );
      }
    } else {
      // If it's published, increment view count
      await blog.trackView();
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// Update blog
export async function PUT(request, { params }) {
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
        { error: 'Active subscription required to update blogs' },
        { status: 403 }
      );
    }

    // Parse request data
    const data = await request.json();
    
    // Update blog fields
    blog.title = data.title;
    blog.content = data.content;
    blog.summary = data.summary;
    blog.category = data.category;
    blog.tags = data.tags;
    blog.featuredImage = data.featuredImage;
    blog.metaTitle = data.metaTitle || data.title;
    blog.metaDescription = data.metaDescription || data.summary;
    
    // Handle status change
    const wasPublished = blog.status === 'published';
    blog.status = data.status || blog.status;
    
    // If publishing for the first time, set published date
    if (!wasPublished && blog.status === 'published') {
      blog.publishedAt = new Date();
    }

    // Save updated blog
    await blog.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Blog updated successfully',
      blog 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// Delete blog
export async function DELETE(request, { params }) {
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

    // Check if user is the author or an admin
    const isAuthor = blog.authorId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this blog' },
        { status: 403 }
      );
    }

    // Delete the blog
    await Blog.deleteOne({ _id: id });

    return NextResponse.json({ 
      success: true, 
      message: 'Blog deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/blogs/[id]/status
// File Path: src/app/api/admin/blogs/[id]/status/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';

// Update blog status
export async function PUT(request, { params }) {
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
    
    // Get the blog ID from the URL params
    const { id } = params;
    
    // Parse request body
    const { status } = await request.json();
    
    // Validate status value
    if (!status || !['published', 'draft', 'archived'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be published, draft, or archived.' },
        { status: 400 }
      );
    }
    
    // Find the blog before updating to check current status
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Update object to apply to the blog
    const update = { status };
    
    // If publishing for the first time, set publishedAt date
    if (status === 'published' && blog.status !== 'published' && !blog.publishedAt) {
      update.publishedAt = new Date();
    }
    
    // Find and update the blog status
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate({
      path: 'author',
      select: 'name email profilePicture role businessName'
    });
    
    return NextResponse.json({
      success: true,
      blog: updatedBlog,
      message: `Blog status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating blog status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
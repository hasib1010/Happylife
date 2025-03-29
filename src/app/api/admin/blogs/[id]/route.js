// API Path: /api/admin/blogs/[id]
// File Path: src/app/api/admin/blogs/[id]/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';

// Get a specific blog by ID
export async function GET(request, { params }) {
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
    
    // Find the blog by ID
    const blog = await Blog.findById(id).populate({
      path: 'author',
      select: 'name email profilePicture role businessName'
    });
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      blog
    });
    
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Update a blog by ID
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
    const data = await request.json();
    
    // Find the blog before updating to check status change
    const existingBlog = await Blog.findById(id);
    
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Check if status is changing to published and set publishedAt if not already set
    if (data.status === 'published' && existingBlog.status !== 'published' && !existingBlog.publishedAt) {
      data.publishedAt = new Date();
    }
    
    // Find and update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate({
      path: 'author',
      select: 'name email profilePicture role businessName'
    });
    
    return NextResponse.json({
      success: true,
      blog: updatedBlog,
      message: 'Blog updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a blog by ID
export async function DELETE(request, { params }) {
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
    
    // Find and delete the blog
    const deletedBlog = await Blog.findByIdAndDelete(id);
    
    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Also delete related comments if they exist
    if (mongoose.models.Comment) {
      await mongoose.models.Comment.deleteMany({ blogId: id });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
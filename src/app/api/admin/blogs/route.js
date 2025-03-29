// API Path: /api/admin/blogs
// File Path: src/app/api/admin/blogs/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';

// Get all blogs with filtering and pagination
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    
    // Calculate offset
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Add search filter if provided
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      };
    }
    
    // Add status filter if provided and not 'all'
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add category filter if provided and not 'all'
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Execute query with pagination
    const blogs = await Blog.find(query)
      .populate({
        path: 'author',
        select: 'name email profilePicture role businessName'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);
    
    return NextResponse.json({
      success: true,
      blogs,
      currentPage: page,
      totalPages,
      totalBlogs
    });
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new blog
export async function POST(request) {
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
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // If authorId is not provided, use the admin's ID
    if (!data.authorId) {
      data.authorId = session.user.id;
    }
    
    // Create new blog
    const newBlog = new Blog(data);
    
    // If status is published, set publishedAt date
    if (data.status === 'published' && !data.publishedAt) {
      newBlog.publishedAt = new Date();
    }
    
    await newBlog.save();
    
    // Fetch the created blog with populated author
    const createdBlog = await Blog.findById(newBlog._id).populate('author');
    
    return NextResponse.json({
      success: true,
      blog: createdBlog,
      message: 'Blog created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
// src/app/api/blogs/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Create a new blog
export async function POST(request) {
  try {
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

    // Get user details
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    if (!user.hasActiveSubscription()) {
      return NextResponse.json(
        { error: 'Active subscription required to create blogs' },
        { status: 403 }
      );
    }

    // Parse request data
    const data = await request.json();
    
    // Create new blog
    const blog = new Blog({
      authorId: user._id,
      title: data.title,
      content: data.content,
      summary: data.summary,
      category: data.category,
      tags: data.tags,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.summary,
      status: data.status || 'draft',
    });

    // If publishing, set published date
    if (data.status === 'published') {
      blog.publishedAt = new Date();
    }

    // Save blog
    await blog.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Blog created successfully',
        blog 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}

// Get all blogs (public endpoint for published blogs only)
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Base query - only return published blogs
    let filter = { status: 'published' };

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add tag filter if provided
    if (tag) {
      filter.tags = tag;
    }

    // Add text search if query provided
    if (query) {
      filter.$text = { $search: query };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    // Fetch blogs with pagination
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name profilePicture');

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
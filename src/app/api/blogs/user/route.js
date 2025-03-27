// src/app/api/blogs/user/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import User from '@/models/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get blogs for the authenticated user
export async function GET(request) {
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

    // Fetch all blogs for this user
    const blogs = await Blog.find({ authorId: user._id })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
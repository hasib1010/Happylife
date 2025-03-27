// src/app/api/blogs/[id]/comments/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import User from '@/models/user';

// Get comments for a blog
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectDB();
    
    // Find the blog
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Get comments for this blog, sorted by newest first
    const comments = await Comment.find({ 
      blogId: id,
      status: 'approved'  // Only return approved comments
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email profilePicture');
    
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Find the blog
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Parse the request
    const { content, parentId } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create the comment
    const comment = new Comment({
      blogId: id,
      userId: user._id,
      content: content.trim(),
      parentId: parentId || null,  // For replies to other comments
      // Set status based on moderation settings
      // For now, we'll auto-approve
      status: 'approved'
    });
    
    await comment.save();
    
    // Update blog comment count
    await blog.addComment();
    
    // Return the created comment
    return NextResponse.json(
      { message: 'Comment added successfully', comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

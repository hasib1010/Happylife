
// src/app/api/blogs/[id]/comments/[commentId]/like/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Comment from '@/models/comment';
import User from '@/models/user';

// Like a comment
export async function POST(request, { params }) {
  try {
    const { id, commentId } = params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to like comments' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Find user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if blog ID matches
    if (comment.blogId.toString() !== id) {
      return NextResponse.json(
        { error: 'Comment does not belong to this blog' },
        { status: 400 }
      );
    }
    
    // Toggle like
    if (comment.likedBy.includes(user._id)) {
      // User already liked, so remove the like
      await comment.removeLike(user._id);
    } else {
      // User hasn't liked, so add the like
      await comment.addLike(user._id);
    }
    
    return NextResponse.json({ 
      message: 'Comment like updated successfully',
      likes: comment.likes,
      isLiked: comment.likedBy.includes(user._id)
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
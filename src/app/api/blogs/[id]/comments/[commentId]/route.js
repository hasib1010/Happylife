// src/app/api/blogs/[id]/comments/[commentId]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import User from '@/models/user';

export async function DELETE(request, { params }) {
    try {
        const { id, commentId } = params;

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to the database
        await connectDB();

        // Find the blog and comment
        const [blog, comment, user] = await Promise.all([
            Blog.findById(id),
            Comment.findById(commentId),
            User.findOne({ email: session.user.email }),
        ]);

        if (!blog || !comment) {
            return NextResponse.json(
                { error: 'Blog or comment not found' },
                { status: 404 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check permissions
        const isCommentAuthor = comment.userId.toString() === user._id.toString();
        const isBlogAuthor = blog.authorId.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isCommentAuthor && !isBlogAuthor && !isAdmin) {
            return NextResponse.json(
                { error: 'You do not have permission to delete this comment' },
                { status: 403 }
            );
        }

        // Delete the comment
        await Comment.deleteOne({ _id: commentId });

        // Update blog comment count
        await Blog.findByIdAndUpdate(id, { $inc: { commentCount: -1 } });

        return NextResponse.json({
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
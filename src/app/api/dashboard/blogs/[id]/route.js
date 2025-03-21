
// src/app/api/dashboard/blogs/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get specific blog
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    const blog = await db.collection('blogs').findOne({
      _id: new ObjectId(id),
      author: new ObjectId(session.user.id)
    });
    
    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update blog
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Ensure user owns this blog
    const blog = await db.collection('blogs').findOne({
      _id: new ObjectId(id),
      author: new ObjectId(session.user.id)
    });
    
    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found or access denied' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated directly
    delete data._id;
    delete data.author;
    delete data.authorType;
    delete data.views;
    delete data.likes;
    delete data.comments;
    delete data.createdAt;
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    // If publishing for the first time, set publishedAt
    if (data.status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    await db.collection('blogs').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete blog
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Ensure user owns this blog
    const blog = await db.collection('blogs').findOne({
      _id: new ObjectId(id),
      author: new ObjectId(session.user.id)
    });
    
    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found or access denied' },
        { status: 404 }
      );
    }
    
    await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
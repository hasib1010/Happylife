// src/app/api/dashboard/blogs/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get all blogs for current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.accountType !== 'provider' && session.user.accountType !== 'product_seller') {
      return NextResponse.json(
        { message: 'Access denied: Not a subscriber' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    const blogs = await db.collection('blogs')
      .find({ author: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new blog
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription
    if (session.user.subscriptionStatus !== 'active' || 
        (session.user.accountType !== 'provider' && session.user.accountType !== 'product_seller')) {
      return NextResponse.json(
        { message: 'Active subscription required' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    const data = await request.json();
    const {
      title,
      content,
      featuredImage,
      tags,
      status,
      relatedProvider,
      relatedProduct
    } = data;
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Missing required blog information' },
        { status: 400 }
      );
    }
    
    // Create new blog
    const newBlog = {
      title,
      content,
      author: new ObjectId(session.user.id),
      authorType: session.user.accountType,
      featuredImage: featuredImage || '',
      tags: tags || [],
      status: status || 'draft',
      views: 0,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add related entities if provided
    if (relatedProvider && ObjectId.isValid(relatedProvider)) {
      // Verify ownership of the provider
      if (session.user.accountType === 'provider') {
        const provider = await db.collection('providers').findOne({
          _id: new ObjectId(relatedProvider),
          userId: new ObjectId(session.user.id)
        });
        
        if (provider) {
          newBlog.relatedProvider = new ObjectId(relatedProvider);
        }
      }
    }
    
    if (relatedProduct && ObjectId.isValid(relatedProduct)) {
      // Verify ownership of the product
      if (session.user.accountType === 'product_seller') {
        const product = await db.collection('products').findOne({
          _id: new ObjectId(relatedProduct),
          sellerId: new ObjectId(session.user.id)
        });
        
        if (product) {
          newBlog.relatedProduct = new ObjectId(relatedProduct);
        }
      }
    }
    
    // Set published date if status is published
    if (newBlog.status === 'published') {
      newBlog.publishedAt = new Date();
    }
    
    const result = await db.collection('blogs').insertOne(newBlog);
    
    return NextResponse.json({
      success: true,
      data: {
        blogId: result.insertedId,
        message: 'Blog created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

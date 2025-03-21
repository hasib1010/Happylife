// src/app/api/dashboard/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get all products for current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.accountType !== 'product_seller') {
      return NextResponse.json(
        { message: 'Access denied: Not a product seller' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    const products = await db.collection('products')
      .find({ sellerId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new product
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
    if (session.user.subscriptionStatus !== 'active' || session.user.accountType !== 'product_seller') {
      return NextResponse.json(
        { message: 'Active product seller subscription required' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    const data = await request.json();
    const {
      name,
      description,
      category,
      subCategory,
      price,
      images,
      ingredients,
      benefits,
      usage,
      stock,
      tags
    } = data;
    
    // Validate required fields
    if (!name || !description || !category || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required product information' },
        { status: 400 }
      );
    }
    
    // Create new product
    const newProduct = {
      name,
      description,
      category,
      subCategory: subCategory || '',
      price: parseFloat(price),
      images: images || [],
      ingredients: ingredients || [],
      benefits: benefits || [],
      usage: usage || '',
      sellerId: new ObjectId(session.user.id),
      stock: parseInt(stock || 0),
      averageRating: 0,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('products').insertOne(newProduct);
    
    return NextResponse.json({
      success: true,
      data: {
        productId: result.insertedId,
        message: 'Product created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

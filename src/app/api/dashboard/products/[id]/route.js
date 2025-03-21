
// src/app/api/dashboard/products/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get specific product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
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
    
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
      sellerId: new ObjectId(session.user.id)
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
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
    
    // Ensure user owns this product
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
      sellerId: new ObjectId(session.user.id)
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or access denied' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated directly
    delete data._id;
    delete data.sellerId;
    delete data.averageRating;
    delete data.createdAt;
    
    // Ensure price and stock are proper numbers
    if (data.price !== undefined) {
      data.price = parseFloat(data.price);
    }
    
    if (data.stock !== undefined) {
      data.stock = parseInt(data.stock);
    }
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
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
    
    // Ensure user owns this product
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
      sellerId: new ObjectId(session.user.id)
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or access denied' },
        { status: 404 }
      );
    }
    
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
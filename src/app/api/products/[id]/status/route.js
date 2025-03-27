// src/app/api/products/[id]/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';

export async function PATCH(request, context) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'You must be signed in to update product status' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get product ID from context params
    const productId = context.params.id;
    
    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this product
    // Allow if user is the seller or an admin
    const isOwner = product.sellerId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to update this product' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    const { status } = data;
    
    // Validate the status
    const validStatuses = ['draft', 'published', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    // If transitioning to published status, check if the seller has an active subscription
    if (status === 'published' && product.status !== 'published') {
      const user = await User.findById(session.user.id);
      
      if (user.role === 'seller' && !user.isSubscribed) {
        return NextResponse.json(
          { success: false, message: 'Active subscription required to publish listings' },
          { status: 403 }
        );
      }
    }
    
    // Update the product status
    product.status = status;
    
    // If transitioning to published, update any additional fields needed
    if (status === 'published') {
      product.publishedAt = new Date();
    }
    
    // Save the changes
    await product.save();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product status updated successfully',
      product: {
        id: product._id,
        title: product.title,
        status: product.status,
        updatedAt: product.updatedAt,
        publishedAt: product.publishedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product status', error: error.message },
      { status: 500 }
    );
  }
}
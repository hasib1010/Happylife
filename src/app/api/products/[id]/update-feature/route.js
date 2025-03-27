// src/app/api/products/[id]/update-feature/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

// For App Router, we need a slightly different approach
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get the URL path components and extract the ID
    const url = request.url;
    const pathParts = url.split('/');
    const productId = pathParts[pathParts.length - 2]; // Get the ID from the URL path
    
    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    
    if (product.sellerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });
    }

    // Prepare update object
    const updateObj = {};
    
    if (data.featureExpiration) {
      updateObj.featureExpiration = new Date(data.featureExpiration);
    }
    
    if (typeof data.isFeatured !== 'undefined') {
      updateObj.isFeatured = Boolean(data.isFeatured);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateObj },
      { new: true, runValidators: false }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Product feature status updated successfully',
      product: {
        id: updatedProduct._id,
        isFeatured: updatedProduct.isFeatured,
        featureExpiration: updatedProduct.featureExpiration
      }
    });
    
  } catch (error) {
    console.error('Error updating product feature status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product feature status', error: error.message },
      { status: 500 }
    );
  }
}
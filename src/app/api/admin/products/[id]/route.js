// API Path: /api/admin/products/[id]
// File Path: src/app/api/admin/products/[id]/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';

// Get a specific product by ID
export async function GET(request, { params }) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get the product ID from the URL params
    const { id } = params;
    
    // Find the product by ID with populated seller
    let product = await Product.findById(id)
      .populate({
        path: 'seller',
        select: 'name email profilePicture businessName role'
      });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Convert to a plain object to allow modifications
    const productObj = product.toObject();
    
    // If the seller is null or undefined despite having a valid sellerId
    if (!productObj.seller && productObj.sellerId) {
      try {
        // Try to manually fetch the seller
        const seller = await User.findById(productObj.sellerId)
          .select('name email profilePicture businessName role');
          
        if (seller) {
          productObj.seller = seller.toObject();
        }
      } catch (err) {
        console.error(`Error fetching seller for product ${productObj._id}:`, err);
      }
    }
    
    return NextResponse.json({
      success: true,
      product: productObj
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Update a product by ID
export async function PUT(request, { params }) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get the product ID from the URL params
    const { id } = params;
    
    // Parse request body
    const data = await request.json();
    
    // If sellerId is being updated, validate it first
    if (data.sellerId) {
      const sellerExists = await User.exists({ _id: data.sellerId });
      if (!sellerExists) {
        return NextResponse.json(
          { success: false, message: 'The specified seller does not exist' },
          { status: 400 }
        );
      }
    }
    
    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate({
      path: 'seller',
      select: 'name email profilePicture businessName role'
    });
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a product by ID
export async function DELETE(request, { params }) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get the product ID from the URL params
    const { id } = params;
    
    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
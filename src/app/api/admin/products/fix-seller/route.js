// API Path: /api/admin/products/fix-seller
// File Path: src/app/api/admin/products/fix-seller/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function POST(request) {
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
    
    // Get request body
    const data = await request.json();
    const { productId, sellerId } = data;
    
    // Validate params
    if (!productId || !sellerId) {
      return NextResponse.json(
        { success: false, message: 'Both productId and sellerId are required' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Update the product's sellerId
    // Using the correct way to set an ObjectId
    product.sellerId = new mongoose.Types.ObjectId(sellerId);
    await product.save();
    
    // Fetch the updated product with seller populated
    const updatedProduct = await Product.findById(productId).populate('seller');
    
    return NextResponse.json({
      success: true,
      message: 'Product seller updated successfully',
      product: {
        _id: updatedProduct._id,
        title: updatedProduct.title,
        sellerId: updatedProduct.sellerId,
        seller: updatedProduct.seller
      }
    });
    
  } catch (error) {
    console.error('Error fixing product seller:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Get available sellers for selection
export async function GET(request) {
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
    
    // Get all sellers
    const sellers = await User.find({ role: { $in: ['seller', 'admin'] } })
      .select('_id name email businessName role')
      .sort({ role: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      sellers
    });
    
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
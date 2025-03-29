// API Path: /api/admin/products/[id]/featured
// File Path: src/app/api/admin/products/[id]/featured/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

// Toggle featured status
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
    const { isFeatured } = await request.json();
    
    // Find and update the product featured status
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: isFeatured ? 'Product marked as featured' : 'Product unfeatured'
    });
    
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
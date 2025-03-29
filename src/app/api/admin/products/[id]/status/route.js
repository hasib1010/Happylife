// API Path: /api/admin/products/[id]/status
// File Path: src/app/api/admin/products/[id]/status/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

// Update product status
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
    const { status } = await request.json();
    
    // Validate status value
    if (!status || !['published', 'draft', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be published, draft, or suspended.' },
        { status: 400 }
      );
    }
    
    // Find and update the product status
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
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
      message: `Product status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
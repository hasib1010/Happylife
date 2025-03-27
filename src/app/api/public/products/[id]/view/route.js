// src/app/api/public/products/[id]/view/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Update the viewCount
    const result = await Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      viewCount: result.viewCount
    });
    
  } catch (error) {
    console.error('Error incrementing product view count:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update view count', error: error.message },
      { status: 500 }
    );
  }
}
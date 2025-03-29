// API Path: /api/admin/products/bulk
// File Path: src/app/api/admin/products/bulk/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

// Handle bulk operations on products
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
    
    // Parse request body
    const { operation, productIds, data } = await request.json();
    
    // Validate required fields
    if (!operation || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Operation and productIds array are required' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Process different bulk operations
    switch (operation) {
      case 'status':
        // Validate status
        if (!data || !data.status || !['published', 'draft', 'suspended'].includes(data.status)) {
          return NextResponse.json(
            { success: false, message: 'Invalid status value' },
            { status: 400 }
          );
        }
        
        // Update status for all products in the list
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { status: data.status } }
        );
        break;
        
      case 'delete':
        // Delete all products in the list
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;
        
      case 'feature':
        // Validate feature flag
        if (data?.isFeatured === undefined) {
          return NextResponse.json(
            { success: false, message: 'isFeatured value is required' },
            { status: 400 }
          );
        }
        
        // Update featured status for all products in the list
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isFeatured: data.isFeatured } }
        );
        break;
        
      case 'activate':
        // Validate active flag
        if (data?.isActive === undefined) {
          return NextResponse.json(
            { success: false, message: 'isActive value is required' },
            { status: 400 }
          );
        }
        
        // Update active status for all products in the list
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isActive: data.isActive } }
        );
        break;
        
      case 'category':
        // Validate category
        if (!data || !data.category) {
          return NextResponse.json(
            { success: false, message: 'Category value is required' },
            { status: 400 }
          );
        }
        
        // Update category for all products in the list
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { category: data.category } }
        );
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Unsupported operation' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      result: {
        operation,
        matchedCount: result.matchedCount || 0,
        modifiedCount: result.modifiedCount || result.deletedCount || 0
      },
      message: `Bulk ${operation} operation completed successfully`
    });
    
  } catch (error) {
    console.error(`Error performing bulk operation:`, error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/products
// File Path: src/app/api/admin/products/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';

// Get all products with filtering and pagination
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    
    // Calculate offset
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Add search filter if provided
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      };
    }
    
    // Add status filter if provided and not 'all'
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add category filter if provided and not 'all'
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Execute query with explicit seller population
    const products = await Product.find(query)
      .populate({
        path: 'seller',
        select: 'name email profilePicture businessName role'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Process the products to handle missing seller information
    const processedProducts = await Promise.all(products.map(async (product) => {
      // Convert to a plain object if it's not already one
      const productObj = product.toObject ? product.toObject() : product;
      
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
      
      return productObj;
    }));
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    
    return NextResponse.json({
      success: true,
      products: processedProducts,
      currentPage: page,
      totalPages,
      totalProducts
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new product (admin only)
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
    const data = await request.json();
    
    // Validate required fields
    if (!data.sellerId || !data.title || !data.description || !data.category || !data.price) {
      return NextResponse.json(
        { success: false, message: 'Seller ID, Title, Description, Category, and Price are required' },
        { status: 400 }
      );
    }
    
    // Verify that the seller exists
    const sellerExists = await User.exists({ _id: data.sellerId });
    if (!sellerExists) {
      return NextResponse.json(
        { success: false, message: 'The specified seller does not exist' },
        { status: 400 }
      );
    }
    
    // Create new product
    const newProduct = new Product(data);
    await newProduct.save();
    
    // Fetch the created product with populated seller
    const createdProduct = await Product.findById(newProduct._id).populate('seller');
    
    return NextResponse.json({
      success: true,
      product: createdProduct,
      message: 'Product created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
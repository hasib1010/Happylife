// src/app/api/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';

// GET all products or products by seller ID
export async function GET(request) {
  try {
    await dbConnect();
    
    const url = new URL(request.url);
    const sellerId = url.searchParams.get('sellerId');
    const category = url.searchParams.get('category');
    const query = url.searchParams.get('query');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build query object
    let queryObject = {};
    
    // Filter by seller ID if provided
    if (sellerId) {
      queryObject.sellerId = sellerId;
    }
    
    // Filter by category if provided
    if (category) {
      queryObject.category = category;
    }
    
    // Filter by status if provided
    if (status) {
      queryObject.status = status;
    } else {
      // By default, only return published products for public access
      // Unless a specific sellerId or status is requested
      if (!sellerId && !status) {
        queryObject.status = 'published';
        queryObject.isActive = true;
      }
    }
    
    // Text search if query is provided
    if (query) {
      queryObject.$text = { $search: query };
    }
    
    // Get total count for pagination
    const total = await Product.countDocuments(queryObject);
    
    // Get products with pagination
    const products = await Product.find(queryObject)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name profilePicture businessName');
    
    // Format the products to be more directory-friendly
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      discountPrice: product.discountPrice,
      currency: product.currency,
      images: product.images,
      features: product.features,
      specifications: product.specifications,
      faqs: product.faqs,
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      tags: product.tags,
      viewCount: product.viewCount,
      contact: product.contact,
      location: product.location,
      businessHours: product.businessHours,
      seller: product.seller ? {
        id: product.seller._id,
        name: product.seller.name,
        businessName: product.seller.businessName,
        profilePicture: product.seller.profilePicture
      } : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    // Return the products with pagination info
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

// CREATE a new product
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'You must be signed in to create a product' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get current user to check subscription status
    const user = await User.findById(session.user.id);
    
    // Check if user has an active subscription
    if (user.role === 'seller' && !user.isSubscribed) {
      return NextResponse.json(
        { success: false, message: 'Active subscription required to create a product listing' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Add seller ID to the product data
    const productData = {
      ...data,
      sellerId: session.user.id
    };
    
    // Create the product
    const product = await Product.create(productData);
    
    if (!product) {
      throw new Error('Failed to create product');
    }
    
    // Return the newly created product
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product._id,
        title: product.title,
        status: product.status,
        createdAt: product.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Format mongoose validation errors
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
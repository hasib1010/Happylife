// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';

// GET product by ID
export async function GET(request, context) {
  try {
    await dbConnect();
    
    // Get product ID from context params
    const productId = context.params.id;
    
    // Find the product
    const product = await Product.findById(productId)
      .populate('seller', 'name profilePicture businessName');
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Increment view count for published products
    if (product.status === 'published') {
      product.viewCount += 1;
      await product.save();
    }
    
    // Format the product data
    const formattedProduct = {
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
    };
    
    // Return the product data
    return NextResponse.json({
      success: true,
      product: formattedProduct
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product', error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE product by ID
export async function PUT(request, context) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'You must be signed in to update a product' },
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
    const updateData = await request.json();
    
    // Fields that are allowed to be updated
    const allowedFields = [
      'title',
      'description',
      'category',
      'subcategory',
      'price',
      'discountPrice',
      'currency',
      'images',
      'features',
      'specifications',
      'faqs',
      'status',
      'isActive',
      'isFeatured',
      'tags',
      'contact',
      'location',
      'businessHours'
    ];
    
    // Create an update object with only allowed fields
    const updateObj = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateObj[field] = updateData[field];
      }
    });
    
    // Clean up social media URLs and empty values
    if (updateObj.contact) {
      if (updateObj.contact.website === '') {
        updateObj.contact.website = undefined;
      }
      
      // Ensure email is still present
      if (!updateObj.contact.email && product.contact.email) {
        updateObj.contact.email = product.contact.email;
      }
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: updatedProduct._id,
        title: updatedProduct.title,
        status: updatedProduct.status,
        updatedAt: updatedProduct.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE product by ID
export async function DELETE(request, context) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'You must be signed in to delete a product' },
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
    
    // Check if user is authorized to delete this product
    // Allow if user is the seller or an admin
    const isOwner = product.sellerId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to delete this product' },
        { status: 403 }
      );
    }
    
    // Delete the product
    await Product.findByIdAndDelete(productId);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      id: productId
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}
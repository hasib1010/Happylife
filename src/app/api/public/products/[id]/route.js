// src/app/api/public/products/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Use aggregation to include user data
    const products = await Product.aggregate([
      { 
        $match: { 
          _id: new mongoose.Types.ObjectId(id),
          status: 'published',
          isActive: true
        } 
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          subcategory: 1,
          price: 1,
          discountPrice: 1,
          currency: 1,
          images: 1,
          features: 1,
          specifications: 1,
          faqs: 1,
          status: 1,
          isActive: 1,
          isFeatured: 1,
          featureExpiration: 1,
          tags: 1,
          viewCount: 1,
          stock: 1,
          contact: 1,
          location: 1,
          businessHours: 1,
          createdAt: 1,
          updatedAt: 1,
          "seller._id": 1,
          "seller.name": 1,
          "seller.businessName": 1,
          "seller.profilePicture": 1
        }
      }
    ]);
    
    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    const product = products[0];
    
    // Format the product for the response
    const formattedProduct = {
      id: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      discountPrice: product.discountPrice,
      currency: product.currency || 'USD',
      images: product.images || [],
      features: product.features || [],
      specifications: product.specifications || [],
      faqs: product.faqs || [],
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
      featureExpiration: product.featureExpiration,
      tags: product.tags || [],
      viewCount: product.viewCount || 0,
      stock: product.stock || 0,
      contact: product.contact || {},
      location: product.location || {},
      businessHours: product.businessHours || [],
      seller: product.seller ? {
        id: product.seller._id,
        name: product.seller.name,
        businessName: product.seller.businessName,
        profilePicture: product.seller.profilePicture
      } : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      product: formattedProduct
    });
    
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product details', error: error.message },
      { status: 500 }
    );
  }
}
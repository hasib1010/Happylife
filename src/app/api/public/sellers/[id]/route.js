// src/app/api/public/sellers/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Product from '@/models/product';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid seller ID' },
        { status: 400 }
      );
    }
    
    // Get seller information
    const seller = await User.findById(id).select(
      'name email profilePicture businessName businessDescription bio phoneNumber address categories isSubscribed role'
    );
    
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Check if seller is a seller or provider
    if (seller.role !== 'seller' && seller.role !== 'provider' && seller.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'This user is not a seller or provider' },
        { status: 400 }
      );
    }
    
    // Get seller's products
    const products = await Product.find({
      sellerId: id,
      status: 'published',
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(6);
    
    // Format seller data
    const formattedSeller = {
      id: seller._id,
      name: seller.name,
      businessName: seller.businessName,
      businessDescription: seller.businessDescription,
      bio: seller.bio,
      profilePicture: seller.profilePicture,
      phoneNumber: seller.phoneNumber,
      email: seller.email,
      address: seller.address,
      categories: seller.categories || [],
      isSubscribed: seller.isSubscribed,
      role: seller.role
    };
    
    // Format product data
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      discountPrice: product.discountPrice,
      currency: product.currency || 'USD',
      images: product.images || [],
      isFeatured: product.isFeatured || false,
      featureExpiration: product.featureExpiration,
      createdAt: product.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      seller: formattedSeller,
      products: formattedProducts
    });
    
  } catch (error) {
    console.error('Error fetching seller details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch seller details', error: error.message },
      { status: 500 }
    );
  }
}
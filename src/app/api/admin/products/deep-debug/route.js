// API Path: /api/admin/products/deep-debug
// File Path: src/app/api/admin/products/deep-debug/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
import User from '@/models/user';
import mongoose from 'mongoose';

// Deep debug API to investigate product-seller issues
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
    const productId = searchParams.get('productId');
    
    let product;
    let directSeller;
    let populatedSeller;
    let rawProduct;
    
    if (productId) {
      // Get a specific product for detailed debugging
      
      // 1. Get the raw product without population
      rawProduct = await Product.findById(productId).lean();
      
      if (!rawProduct) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }
      
      // 2. Get the product with automatic population
      product = await Product.findById(productId);
      
      // 3. Explicitly try to find the seller
      if (rawProduct.sellerId) {
        try {
          directSeller = await User.findById(rawProduct.sellerId).select('_id name email businessName role').lean();
        } catch (err) {
          directSeller = { error: err.message };
        }
      }
      
      // 4. Try explicit population
      try {
        const explicitPopulated = await Product.findById(productId).populate({
          path: 'seller',
          select: 'name email profilePicture businessName role'
        });
        populatedSeller = explicitPopulated.seller;
      } catch (err) {
        populatedSeller = { error: err.message };
      }
      
      return NextResponse.json({
        success: true,
        productId,
        debug: {
          // Basic info
          rawProductHasSellerId: !!rawProduct.sellerId,
          sellerId: rawProduct.sellerId ? rawProduct.sellerId.toString() : null,
          sellerIdType: rawProduct.sellerId ? typeof rawProduct.sellerId : 'none',
          sellerIdIsValidObjectId: rawProduct.sellerId ? mongoose.Types.ObjectId.isValid(rawProduct.sellerId) : false,
          
          // Virtual field check
          virtualFieldExists: !!product.seller,
          
          // Direct lookup vs population
          directSellerFound: !!directSeller,
          explicitPopulationWorked: !!populatedSeller && !populatedSeller.error,
          
          // Detailed info for debugging
          rawProduct: {
            _id: rawProduct._id,
            title: rawProduct.title,
            sellerId: rawProduct.sellerId
          },
          productJSON: JSON.parse(JSON.stringify(product)),
          directSeller,
          populatedSeller
        }
      });
    } else {
      // General debugging for all products
      
      // Get a sample of products (first 10)
      const products = await Product.find().limit(10);
      
      // Analyze the sample
      const analysis = await Promise.all(products.map(async (product) => {
        const rawProduct = product.toObject();
        
        let directSeller = null;
        if (product.sellerId) {
          try {
            directSeller = await User.findById(product.sellerId).select('_id name email').lean();
          } catch (err) {
            directSeller = { error: err.message };
          }
        }
        
        return {
          _id: product._id,
          title: product.title,
          hasSellerId: !!product.sellerId,
          sellerIdValue: product.sellerId ? product.sellerId.toString() : null,
          hasSellerVirtual: !!product.seller,
          directSellerFound: !!directSeller,
          sellerDetails: product.seller ? {
            id: product.seller._id,
            name: product.seller.name,
            email: product.seller.email
          } : null,
          directSellerDetails: directSeller ? {
            id: directSeller._id,
            name: directSeller.name,
            email: directSeller.email
          } : null
        };
      }));
      
      return NextResponse.json({
        success: true,
        debug: {
          sampleSize: products.length,
          productAnalysis: analysis,
          modelInfo: {
            hasVirtualsEnabled: !!(Product.schema.options.toJSON && Product.schema.options.toJSON.virtuals),
            hasPopulateMiddleware: !!Product.schema._middlewareFunctions.find(mw => 
              mw.name === 'pre' && String(mw.query).includes('find') && String(mw.fn).includes('populate')
            )
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error debugging products:', error);
    return NextResponse.json(
      { success: false, message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
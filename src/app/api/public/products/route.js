// src/app/api/public/products/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/product';
 
export async function GET(request) {
    try {
      await dbConnect();
      
      const url = new URL(request.url);
      const sellerId = url.searchParams.get('sellerId');
      const category = url.searchParams.get('category');
      const query = url.searchParams.get('query');
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      const sort = url.searchParams.get('sort') || 'createdAt';
      const order = url.searchParams.get('order') || 'desc';
      const skip = (page - 1) * limit;
      
      // Build query object for filtering
      let queryObject = {
        status: 'published',
        isActive: true
      };
      
      // Filter by seller ID if provided
      if (sellerId) {
        queryObject.sellerId = sellerId;
      }
      
      // Filter by category if provided
      if (category) {
        queryObject.category = category;
      }
      
      // Search functionality if query is provided
      if (query) {
        queryObject.$text = { $search: query };
      }
      
      // Get total count for pagination
      const total = await Product.countDocuments(queryObject);
      
      // Build sort object
      const sortQuery = {};
      // Handle special sort cases
      if (sort === 'price') {
        sortQuery.price = order === 'asc' ? 1 : -1;
      } else if (sort === 'popular') {
        sortQuery.viewCount = -1;
      } else {
        // Default sort by creation date
        sortQuery[sort] = order === 'asc' ? 1 : -1;
      }
      
      // Important: Add the current date for comparing feature expiration
      const currentDate = new Date();
      
      // Build the aggregation pipeline
      const pipeline = [
        { $match: queryObject },
        { 
          $addFields: {
            // Create a sortByFeatured field that will be 1 for featured products, 0 for others
            sortByFeatured: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$isFeatured", true] },
                    { $gt: ["$featureExpiration", currentDate] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
        // Sort by featured status first, then by the requested sort field
        { 
          $sort: {
            sortByFeatured: -1, // Featured first
            ...sortQuery    // Then by user's sort preference
          }
        },
        { $skip: skip },
        { $limit: limit },
        // Lookup seller information
        {
          $lookup: {
            from: "users",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller"
          }
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
        // Project only the fields we need
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
            status: 1,
            isActive: 1,
            isFeatured: 1,
            featureExpiration: 1, // Include this to check featured status on client
            tags: 1,
            viewCount: 1,
            createdAt: 1,
            updatedAt: 1,
            "seller._id": 1,
            "seller.name": 1,
            "seller.businessName": 1,
            "seller.profilePicture": 1
          }
        }
      ];
      
      // Execute the aggregation pipeline
      const products = await Product.aggregate(pipeline);
      
      // Format products for response
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
        features: product.features || [],
        isFeatured: product.isFeatured || false,
        featureExpiration: product.featureExpiration, // Pass this to client
        tags: product.tags || [],
        viewCount: product.viewCount || 0,
        seller: product.seller ? {
          id: product.seller._id,
          name: product.seller.name,
          businessName: product.seller.businessName,
          profilePicture: product.seller.profilePicture
        } : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));
      
      // Get categories for filters
      const categories = await Product.distinct('category', { status: 'published', isActive: true });
      
      // Return the products with pagination info
      return NextResponse.json({
        success: true,
        products: formattedProducts,
        categories,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      });
      
    } catch (error) {
      console.error('Error fetching public products:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch products', error: error.message },
        { status: 500 }
      );
    }
  }
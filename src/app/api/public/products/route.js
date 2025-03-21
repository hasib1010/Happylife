// src/app/api/public/products/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const minRating = searchParams.get('minRating') || 0;
    const maxPrice = searchParams.get('maxPrice') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'rating';

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = {};
    
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      searchFilter.category = { $regex: category, $options: 'i' };
    }

    if (minRating) {
      searchFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      searchFilter.price = { $lte: parseFloat(maxPrice) };
    }

    // Ensure products have stock available
    searchFilter.stock = { $gt: 0 };

    // Determine sort order
    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'price_low') {
      sortOption = { price: 1 };
    } else if (sort === 'price_high') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const { db } = await connectToDatabase();
    
    const total = await db.collection('products').countDocuments(searchFilter);
    
    const products = await db.collection('products')
      .find(searchFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
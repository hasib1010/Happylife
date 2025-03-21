// src/app/api/public/providers/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const minRating = searchParams.get('minRating') || 0;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'rating';

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = {};
    
    if (query) {
      searchFilter.$or = [
        { businessName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      searchFilter.specialties = { $regex: category, $options: 'i' };
    }

    if (location) {
      searchFilter['location.city'] = { $regex: location, $options: 'i' };
    }

    if (minRating) {
      searchFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Only return verified providers with active subscription status
    searchFilter.isVerified = true;

    // Determine sort order
    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'name') {
      sortOption = { businessName: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const { db } = await connectToDatabase();
    
    const total = await db.collection('providers').countDocuments(searchFilter);
    
    const providers = await db.collection('providers')
      .find(searchFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        providers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
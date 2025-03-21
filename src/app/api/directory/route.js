// src/app/api/directory/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import Directory from '@/models/Directory';
import User from '@/models/User';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * GET handler - fetch directory listings (with filtering)
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Build query from search parameters
    const query = { isActive: true };
    
    // Category filter
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }
    
    // Listing type filter
    const listingType = searchParams.get('type');
    if (listingType && ['service', 'product', 'both'].includes(listingType)) {
      query.listingType = listingType;
    }
    
    // Location filter
    const city = searchParams.get('city');
    if (city) {
      query['location.city'] = { $regex: new RegExp(city, 'i') };
    }
    
    const state = searchParams.get('state');
    if (state) {
      query['location.state'] = { $regex: new RegExp(state, 'i') };
    }
    
    // Featured filter
    const featured = searchParams.get('featured');
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Verified filter
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      query.isVerified = true;
    }
    
    // Search term
    const search = searchParams.get('search');
    if (search) {
      query.$text = { $search: search };
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Sort options
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sortOptions = {};
    
    // Always prioritize featured listings
    sortOptions.isFeatured = -1;
    
    // If sorting by rating or reviews, add a secondary sort by createdAt
    if (sortField === 'averageRating' || sortField === 'reviewCount') {
      sortOptions[sortField] = sortOrder;
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortField] = sortOrder;
    }
    
    // Execute query with pagination
    const directories = await Directory.find(query)
      .populate('owner', 'name email profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Directory.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: directories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching directory:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching directory listings' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - create a new directory listing
 */
export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if subscription is active
    if (user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Active subscription required to create directory listings' },
        { status: 403 }
      );
    }
    
    // Check if user already has a directory listing
    const existingListing = await Directory.findOne({ owner: user._id });
    if (existingListing) {
      return NextResponse.json(
        { success: false, message: 'You already have a directory listing. Please update your existing listing.' },
        { status: 400 }
      );
    }
    
    // Get directory data from request
    const directoryData = await request.json();
    
    // Set owner to current user
    directoryData.owner = user._id;
    
    // Set default membership status to active
    directoryData.membershipStatus = 'active';
    
    // Create the directory listing
    const directory = await Directory.create(directoryData);
    
    return NextResponse.json(
      { success: true, message: 'Directory listing created successfully', data: directory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating directory listing:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: validationErrors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating directory listing' },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/services
// File Path: src/app/api/admin/services/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

// Get all services with filtering and pagination
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
          { businessName: { $regex: search, $options: 'i' } },
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
    
    // Execute query with pagination
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalServices = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalServices / limit);
    
    return NextResponse.json({
      success: true,
      services,
      currentPage: page,
      totalPages,
      totalServices
    });
    
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new service (admin only)
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
    if (!data.providerId || !data.businessName || !data.description || !data.category) {
      return NextResponse.json(
        { success: false, message: 'Provider ID, Business Name, Description, and Category are required' },
        { status: 400 }
      );
    }
    
    // Create new service
    const newService = new Service(data);
    await newService.save();
    
    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Service created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
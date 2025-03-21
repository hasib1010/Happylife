// src/app/api/directory/[slug]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import Directory from '@/models/Directory';
import User from '@/models/User';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * GET handler - fetch a single directory listing by slug
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    // Find directory by slug
    const directory = await Directory.findOne({ slug, isActive: true })
      .populate('owner', 'name email profileImage')
      .populate('services')
      .populate('products')
      .lean();
    
    if (!directory) {
      return NextResponse.json(
        { success: false, message: 'Directory listing not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Directory.findOneAndUpdate(
      { slug: slug },
      { $inc: { views: 1 } }
    );
    
    return NextResponse.json({
      success: true,
      data: directory
    });
  } catch (error) {
    console.error(`Error fetching directory listing ${params.slug}:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching directory listing' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - update a directory listing
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
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
    
    // Find the directory listing
    const directory = await Directory.findOne({ slug });
    
    if (!directory) {
      return NextResponse.json(
        { success: false, message: 'Directory listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    if (directory.owner.toString() !== decoded.id) {
      // Check if user is admin (future feature)
      const user = await User.findById(decoded.id);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Not authorized to update this directory listing' },
          { status: 403 }
        );
      }
    }
    
    // Get updated data
    const updatedData = await request.json();
    
    // Fields that should not be updated directly by users
    delete updatedData.owner;
    delete updatedData.membershipStatus;
    delete updatedData.createdAt;
    delete updatedData.slug; // Slug gets auto-generated if name changes
    delete updatedData.views;
    delete updatedData.reviewCount;
    delete updatedData.averageRating;
    delete updatedData.isVerified; // Only admins can verify listings
    delete updatedData.featuredUntil; // Set through a separate featured API
    delete updatedData.isFeatured; // Set through a separate featured API
    
    // Update the directory
    const updatedDirectory = await Directory.findOneAndUpdate(
      { slug },
      updatedData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email profileImage');
    
    return NextResponse.json({
      success: true,
      message: 'Directory listing updated successfully',
      data: updatedDirectory
    });
  } catch (error) {
    console.error(`Error updating directory listing ${params.slug}:`, error);
    
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
      { success: false, message: error.message || 'Error updating directory listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - delete a directory listing
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
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
    
    // Find the directory listing
    const directory = await Directory.findOne({ slug });
    
    if (!directory) {
      return NextResponse.json(
        { success: false, message: 'Directory listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    if (directory.owner.toString() !== decoded.id) {
      // Check if user is admin (future feature)
      const user = await User.findById(decoded.id);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Not authorized to delete this directory listing' },
          { status: 403 }
        );
      }
    }
    
    // Delete the directory listing
    await Directory.findOneAndDelete({ slug });
    
    return NextResponse.json({
      success: true,
      message: 'Directory listing deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting directory listing ${params.slug}:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting directory listing' },
      { status: 500 }
    );
  }
}
// API Path: /api/admin/services/[id]/featured
// File Path: src/app/api/admin/services/[id]/featured/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

// Toggle featured status and set expiration date
export async function PUT(request, { params }) {
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
    
    // Get the service ID from the URL params
    const { id } = params;
    
    // Parse request body
    const { isFeatured, durationDays } = await request.json();
    
    // Calculate feature expiration date if provided
    let updateData = { isFeatured };
    
    // If featuring the service and duration provided, set expiration date
    if (isFeatured && durationDays) {
      const featureExpiration = new Date();
      featureExpiration.setDate(featureExpiration.getDate() + parseInt(durationDays));
      updateData.featureExpiration = featureExpiration;
    }
    
    // If unfeaturing, remove the expiration date
    if (!isFeatured) {
      updateData.featureExpiration = null;
    }
    
    // Find and update the service featured status
    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedService) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      service: updatedService,
      message: isFeatured ? 'Service marked as featured' : 'Service unfeatured'
    });
    
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
// src/app/api/update-status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Service from '@/models/service';
import { connectDB } from '@/lib/database';
import mongoose from 'mongoose';

export async function POST(request) {
  console.log('Status update API called');
  await connectDB();

  try {
    // Parse request body
    const data = await request.json();
    console.log('Request data:', data);
    
    const { id, status } = data;
    
    // Validate inputs
    if (!id) {
      console.error('Missing ID in request');
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    if (!status) {
      console.error('Missing status in request');
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate the status value
    const validStatuses = ['draft', 'published', 'suspended'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return NextResponse.json(
        { error: `Invalid status value: ${status}. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.id);

    // Find the service with more flexible ID handling
    let service;
    
    // Try multiple approaches to find the service
    const queries = [
      // Direct MongoDB ID lookup
      async () => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          console.log('Trying MongoDB ObjectId lookup');
          return await Service.findById(new mongoose.Types.ObjectId(id));
        }
        return null;
      },
      
      // String ID lookup as fallback
      async () => {
        console.log('Trying string ID lookup');
        return await Service.findOne({ _id: id.toString() });
      }
    ];
    
    // Try each query strategy until we find the service
    for (const query of queries) {
      service = await query();
      if (service) {
        console.log('Service found using query strategy');
        break;
      }
    }

    if (!service) {
      console.error('Service not found with ID:', id);
      return NextResponse.json(
        { error: `Service not found with ID: ${id}` },
        { status: 404 }
      );
    }

    console.log('Found service:', {
      id: service._id,
      title: service.title || service.businessName,
      providerId: service.providerId?.toString() || 'unknown'
    });

    // Verify ownership - only the provider or an admin can update the status
    const isAdmin = session.user.role === 'admin';
    const isOwner = service.providerId && service.providerId.toString() === session.user.id;
    
    if (!isAdmin && !isOwner) {
      console.error('Permission denied. User ID:', session.user.id, 'Provider ID:', service.providerId?.toString());
      return NextResponse.json(
        { error: 'You do not have permission to update this service' },
        { status: 403 }
      );
    }

    // Update the status
    service.status = status;
    
    // Update lastPublishedAt if status is changing to published
    if (status === 'published' && service.status !== 'published') {
      service.lastPublishedAt = new Date();
    }

    // Save the updated service
    await service.save();
    console.log('Status updated successfully to:', status);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Service status updated successfully',
      service: {
        id: service._id,
        status: service.status,
        lastPublishedAt: service.lastPublishedAt
      }
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    
    return NextResponse.json(
      { error: 'Failed to update service status', message: error.message },
      { status: 500 }
    );
  }
}
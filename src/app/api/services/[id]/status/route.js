// src/app/api/services/[serviceId]/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Service from '@/models/service';
import { connectDB } from '@/lib/database';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  console.log('Starting status update API request with params:', params);
  
  // Log the raw URL to see how Next.js is parsing it
  console.log('Raw URL:', request.url);
  
  // Check if params even exists
  if (!params) {
    console.error('No params object provided by Next.js router');
    return NextResponse.json(
      { error: 'Missing route parameters' },
      { status: 400 }
    );
  }

  // Get the service ID from params with a fallback
  const serviceId = params.serviceId;
  console.log('Service ID from params:', serviceId);
  
  if (!serviceId) {
    console.error('No serviceId found in route parameters');
    return NextResponse.json(
      { error: 'Missing service ID in route' },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    // Parse request body
    let bodyText;
    try {
      bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      
      // Try to parse as JSON
      const bodyData = JSON.parse(bodyText);
      console.log('Parsed body data:', bodyData);
      
      // Extract status
      const { status } = bodyData;
      
      if (!status) {
        return NextResponse.json(
          { error: 'Status is required in request body' },
          { status: 400 }
        );
      }

      // Validate the status value
      const validStatuses = ['draft', 'published', 'suspended'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status value: ${status}. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Authenticate the user
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
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
          if (mongoose.Types.ObjectId.isValid(serviceId)) {
            console.log('Trying MongoDB ObjectId lookup');
            return await Service.findById(new mongoose.Types.ObjectId(serviceId));
          }
          return null;
        },
        
        // String ID lookup as fallback
        async () => {
          console.log('Trying string ID lookup');
          return await Service.findOne({ _id: serviceId.toString() });
        },
        
        // Try other potential ID fields if we have them in the model
        async () => {
          console.log('Trying custom ID lookups');
          return await Service.findOne({ 
            $or: [
              { id: serviceId },
              { customId: serviceId }
            ] 
          });
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
        console.error('Service not found with ID:', serviceId);
        return NextResponse.json(
          { error: `Service not found with ID: ${serviceId}` },
          { status: 404 }
        );
      }

      console.log('Found service:', {
        id: service._id,
        title: service.title || service.businessName,
        providerId: service.providerId?.toString()
      });

      // Verify ownership - only the provider or an admin can update the status
      const isAdmin = session.user.role === 'admin';
      const isOwner = service.providerId?.toString() === session.user.id;
      
      if (!isAdmin && !isOwner) {
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
      
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating service status:', error);
    
    return NextResponse.json(
      { error: 'Failed to update service status', message: error.message },
      { status: 500 }
    );
  }
}
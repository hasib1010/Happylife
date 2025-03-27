// src/app/api/services/[id]/update-feature/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

export async function POST(request, { params }) {
  try {
    // Connect to database
    await dbConnect();

    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {A
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceId = params.id;
    const { featureExpiration } = await request.json();
    
    // Find the service
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (service.providerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this service' }, { status: 403 });
    }
    
    // Update the service
    service.featureExpiration = new Date(featureExpiration);
    await service.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feature expiration updated',
      featureExpiration: service.featureExpiration 
    });
  } catch (error) {
    console.error('Error updating feature expiration:', error);
    return NextResponse.json(
      { error: 'Failed to update feature expiration', message: error.message },
      { status: 500 }
    );
  }
}
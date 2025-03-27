// src/app/api/public/services/[id]/track-click/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const serviceId = params.id;
    const body = await request.json();
    const { clickType } = body;
    
    console.log(`Tracking ${clickType} click for service:`, serviceId);
    
    // Validate if service exists and is active
    const service = await Service.findById(serviceId);
    
    if (!service) {
      console.log('Directory listing not found');
      return NextResponse.json({ error: 'Directory listing not found' }, { status: 404 });
    }
    
    // Only track clicks for published and active services
    if (service.status !== 'published' || !service.isActive) {
      console.log('Cannot track clicks for inactive listing');
      return NextResponse.json({ error: 'Directory listing not active' }, { status: 403 });
    }
    
    // Increment general click count
    await Service.updateOne(
      { _id: serviceId },
      { $inc: { clickCount: 1 } }
    );
    
    // If we're tracking specific click types, update those counts too
    // This uses MongoDB's dot notation to update nested fields
    if (clickType) {
      const updateQuery = {};
      updateQuery[`clickAnalytics.${clickType}`] = 1;
      
      await Service.updateOne(
        { _id: serviceId },
        { $inc: updateQuery }
      );
      
      console.log(`Incremented ${clickType} click count`);
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Click tracked successfully for ${clickType || 'general'}`
    });
    
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Failed to track click', message: error.message },
      { status: 500 }
    );
  }
}
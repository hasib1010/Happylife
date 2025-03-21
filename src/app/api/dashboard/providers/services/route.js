
// src/app/api/dashboard/providers/services/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Add service to provider
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check subscription
    if (session.user.subscriptionStatus !== 'active' || session.user.accountType !== 'provider') {
      return NextResponse.json(
        { message: 'Active provider subscription required' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get provider ID
    const provider = await db.collection('providers').findOne({
      userId: new ObjectId(session.user.id)
    });
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider profile not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    const { name, description, duration, price } = data;
    
    // Validate required fields
    if (!name || !description || !duration || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required service information' },
        { status: 400 }
      );
    }
    
    const newService = {
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price)
    };
    
    await db.collection('providers').updateOne(
      { _id: provider._id },
      { 
        $push: { servicesOffered: newService },
        $set: { updatedAt: new Date() }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Service added successfully',
    });
  } catch (error) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
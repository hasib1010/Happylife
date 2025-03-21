// src/app/api/dashboard/providers/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Create new provider profile
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has active subscription and is a provider
    if (session.user.subscriptionStatus !== 'active' || session.user.accountType !== 'provider') {
      return NextResponse.json(
        { message: 'Active provider subscription required' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Check if user already has a provider profile
    const existingProvider = await db.collection('providers').findOne({
      userId: new ObjectId(session.user.id)
    });
    
    if (existingProvider) {
      return NextResponse.json(
        { message: 'Provider profile already exists' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const {
      businessName,
      description,
      specialties,
      servicesOffered,
      location,
      contactInfo,
      workingHours
    } = data;
    
    // Validate required fields
    if (!businessName || !description || !specialties || !location || !contactInfo) {
      return NextResponse.json(
        { message: 'Missing required provider information' },
        { status: 400 }
      );
    }
    
    // Create new provider profile
    const newProvider = {
      userId: new ObjectId(session.user.id),
      businessName,
      description,
      specialties: Array.isArray(specialties) ? specialties : [specialties],
      servicesOffered: servicesOffered || [],
      certifications: [],
      location,
      contactInfo,
      workingHours: workingHours || [],
      gallery: [],
      averageRating: 0,
      isVerified: false, // Requires admin verification
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('providers').insertOne(newProvider);
    
    return NextResponse.json({
      success: true,
      data: {
        providerId: result.insertedId,
        message: 'Provider profile created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating provider profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get provider profile for current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    const provider = await db.collection('providers').findOne({
      userId: new ObjectId(session.user.id)
    });
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

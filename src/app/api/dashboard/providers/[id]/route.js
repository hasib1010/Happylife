// src/app/api/dashboard/providers/[id]/route.js (continued)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Update provider profile
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Ensure user owns this provider profile
    const provider = await db.collection('providers').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id)
    });
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider not found or access denied' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated directly
    delete data._id;
    delete data.userId;
    delete data.isVerified;
    delete data.averageRating;
    delete data.createdAt;
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await db.collection('providers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Provider profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get specific provider profile for logged-in user
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    const provider = await db.collection('providers').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id)
    });
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider not found or access denied' },
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

// Delete provider profile
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid provider ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Ensure user owns this provider profile
    const provider = await db.collection('providers').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id)
    });
    
    if (!provider) {
      return NextResponse.json(
        { message: 'Provider not found or access denied' },
        { status: 404 }
      );
    }
    
    // Check if there are active bookings
    const activeBookings = await db.collection('bookings').findOne({
      provider: new ObjectId(id),
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeBookings) {
      return NextResponse.json(
        { message: 'Cannot delete provider with active bookings' },
        { status: 400 }
      );
    }
    
    // Delete provider
    await db.collection('providers').deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      message: 'Provider profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting provider profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

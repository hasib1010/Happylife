// src/app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';

// GET user profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to access this resource' }, 
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Find user but exclude password field
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', message: error.message }, 
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to access this resource' }, 
        { status: 401 }
      );
    }
    
    const { user: updatedUserData } = await request.json();
    
    await dbConnect();
    
    // Find user before update
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Fields that are allowed to be updated by the user
    const allowedFields = [
      'name',
      'bio',
      'phoneNumber',
      'address',
      'profilePicture',
      'businessName',
      'businessDescription',
      'categories'
    ];
    
    // Update only allowed fields
    allowedFields.forEach(field => {
      if (updatedUserData[field] !== undefined) {
        // Handle nested fields like address
        if (field === 'address' && typeof updatedUserData.address === 'object') {
          user.address = {
            ...(user.address || {}),
            ...updatedUserData.address
          };
        } else {
          user[field] = updatedUserData[field];
        }
      }
    });
    
    // Save updated user
    await user.save();
    
    // Return updated user without password
    const savedUser = user.toObject();
    delete savedUser.password;
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile', message: error.message }, 
      { status: 500 }
    );
  }
}
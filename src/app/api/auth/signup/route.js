import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const userData = await request.json();
    
    // Extract required fields
    const { 
      name, 
      email, 
      password, 
      role, 
      businessName, 
      businessDescription, 
      serviceCategory,
      specialties,
      categories
    } = userData;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook in the User model
      role: role || 'user',
      businessName,
      businessDescription,
      categories: categories || (serviceCategory ? [serviceCategory] : []),
      specialties,
      isVerified: false, // Set to false until email verification
      isActive: true,
    });

    await newUser.save();

    // Check if JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const userWithoutPassword = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      businessName: newUser.businessName,
      specialties: newUser.specialties,
      categories: newUser.categories,
      isVerified: newUser.isVerified,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      message: 'Signup successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    const { name, email, password } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Define User model dynamically if needed
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      accountType: { type: String, default: 'regular' },
      subscriptionStatus: { type: String, default: 'none' },
      profileImage: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }));
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      accountType: 'regular',
      subscriptionStatus: 'none',
      profileImage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await newUser.save();
    
    // Create a sanitized user object (without password) to return
    const sanitizedUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      accountType: newUser.accountType,
      subscriptionStatus: newUser.subscriptionStatus,
    };
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
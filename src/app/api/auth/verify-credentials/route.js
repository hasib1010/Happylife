// src/app/api/auth/verify-credentials/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Connect to MongoDB using mongoose only
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  return mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(request) {
  try {
    // Connect to database using mongoose
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email - use mongoose directly without importing models
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      accountType: String,
      subscriptionStatus: String,
    }));
    
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Return success with sanitized user info
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType || 'regular',
        subscriptionStatus: user.subscriptionStatus || 'none',
      }
    });
  } catch (error) {
    console.error('Credential verification error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
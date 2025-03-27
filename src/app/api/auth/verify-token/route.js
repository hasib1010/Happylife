// src/app/api/auth/verify-token/route.js
import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 400 }
      );
    }
    
    // Create secret key once - define it here
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    // Verify the token
    let decoded;
    try {
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
      console.log('Decoded token:', JSON.stringify(decoded));
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Extract user ID properly
    const userId = typeof decoded.id === 'object' 
      ? decoded.id.toString() 
      : decoded.id;
      
    console.log('Looking up user with ID:', userId);
    
    // Find user by ID or email
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      // If ID lookup fails, try email
      if (decoded.email) {
        user = await User.findOne({ email: decoded.email });
      }
    }
    
    // If still no user, try email directly
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email });
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      isSubscribed: user.isSubscribed,
      profilePicture: user.profilePicture
    };
    
    // Create a session token using the SAME secret
    const sessionToken = await new SignJWT({
      ...userData,
      id: userData.id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret); // Using the secret defined above
    
    // Set the token in the response
    const response = NextResponse.json({
      success: true,
      user: userData
    });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
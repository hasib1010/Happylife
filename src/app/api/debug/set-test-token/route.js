// src/app/api/debug/set-test-token/route.js (DELETE THIS AFTER TESTING!)
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export async function GET(request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const testToken = "test123"; // Simple token for testing
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }
  
  try {
    await dbConnect();
    
    // Find the user first
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(testToken)
      .digest('hex');
    
    // Calculate expiry - 24 hours from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    // Update user with test token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiryDate;
    
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Test token set',
      user: user.email,
      testResetUrl: `http://localhost:3000/auth/reset-password?token=${testToken}`,
      expiresAt: user.resetPasswordExpires.toISOString()
    });
  } catch (error) {
    console.error('Error setting test token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// src/app/api/auth/verify-email/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';

/**
 * Verify email address
 */
export async function GET(request) {
  try {
    // Get token from URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() } // Token must not be expired
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }
    
    // Mark email as verified and clear verification fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    
    await user.save();
    
    // Redirect to login page with success message
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.append('verified', 'true');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    // Redirect to error page
    const redirectUrl = new URL('/auth/verification-error', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}

/**
 * Resend verification email
 */
export async function POST(request) {
  try {
    await connectDB();
    
    // Get request data
    const data = await request.json();
    const { email } = data;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a verification link'
      });
    }
    
    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified'
      });
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save token to user record
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();
    
    // In a real app, you would send an email with the verification link
    // For demo purposes, we'll just return the token
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    console.log('Verification link:', verificationLink);
    
    return NextResponse.json({
      success: true,
      message: 'Verification link has been sent to your email',
      // In development/testing, include the token and link
      ...(process.env.NODE_ENV !== 'production' && {
        verificationToken,
        verificationLink
      })
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
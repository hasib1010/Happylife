// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import { sendEmail } from '@/lib/email';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { email } = await request.json();
    console.log('Password reset requested for:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email });

    // If no user found, still return success to prevent email enumeration
    if (!user) {
      console.log('No user found with email:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    console.log('User found:', user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated token (first 10 chars):', resetToken.substring(0, 10) + '...');
    
    // Hash the token for storage
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log('Hashed token for storage (first 10 chars):', hashedToken.substring(0, 10) + '...');
    
    // Set token expiry (1 hour from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    
    // Use direct MongoDB update to ensure fields are set correctly
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiry
        }
      }
    );
    
    console.log('DB update result:', updateResult);
    console.log('Token saved to user record. Expires:', expiry.toISOString());

    // Double-check the token was saved correctly
    const updatedUser = await mongoose.connection.db.collection('users').findOne({ _id: user._id });
    console.log('User has reset token after update:', !!updatedUser.resetPasswordToken);
    if (updatedUser.resetPasswordToken) {
      console.log('Stored token hash (first 10 chars):', updatedUser.resetPasswordToken.substring(0, 10) + '...');
    }

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    console.log('Reset URL (sanitized):', resetUrl.replace(resetToken, resetToken.substring(0, 5) + '...'));

    // Email content
    const message = `
      <p>You requested a password reset for your happylife.services account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link is valid for 1 hour.</p>
      <p>Token: ${resetToken}</p>
    `;

    try {
      console.log('Attempting to send email to:', user.email);
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - happylife.services',
        html: message,
      });
      console.log('Email sent successfully');

      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // Roll back token changes
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $unset: { resetPasswordToken: "", resetPasswordExpires: "" } }
      );

      return NextResponse.json(
        { success: false, message: 'Error sending email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
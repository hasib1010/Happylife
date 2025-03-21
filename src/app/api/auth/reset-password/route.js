// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Request password reset
 */
export async function POST(request) {
  try {
    await connectDB();
    
    // Get request data
    const data = await request.json();
    const { email, token, newPassword } = data;
    
    // Handle password reset request (when only email is provided)
    if (email && !token && !newPassword) {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return NextResponse.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Save token to user record
      user.passwordResetToken = resetToken;
      user.passwordResetExpiry = resetExpiry;
      await user.save();
      
      // In a real app, you would send an email with the reset link
      // For demo purposes, we'll just return the token
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
      
      console.log('Password reset link:', resetLink);
      
      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email',
        // In development/testing, include the token and link
        ...(process.env.NODE_ENV !== 'production' && {
          resetToken,
          resetLink
        })
      });
    }
    
    // Handle password reset (when token and new password are provided)
    if (token && newPassword) {
      // Find user by reset token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: Date.now() } // Token must not be expired
      });
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }
      
      // Password policy checks
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password and clear reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      
      // Reset login attempts if they were locked out
      user.loginAttempts = 0;
      user.lockUntil = null;
      
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    }
    
    // Invalid request
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
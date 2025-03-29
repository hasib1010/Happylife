// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    console.log('Reset password request received for token:', token ? token.substring(0, 10) + '...' : 'undefined');

    if (!token || !password) {
      console.log('Missing token or password in request');
      return NextResponse.json(
        { success: false, message: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Hash the token to compare with the stored one
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('Looking for user with hashed token (first 15 chars):', hashedToken.substring(0, 15) + '...');

    // Use direct MongoDB query first for debugging
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Find all users with reset tokens for debugging
    const usersWithTokens = await usersCollection.find({
      resetPasswordToken: { $exists: true, $ne: null }
    }).toArray();
    
    console.log('Users with reset tokens (direct MongoDB):', usersWithTokens.length);
    usersWithTokens.forEach(u => {
      console.log(`- ${u.email}: Token starting with ${u.resetPasswordToken.substring(0, 15)}..., expires ${new Date(u.resetPasswordExpires).toISOString()}`);
    });

    // Find user with direct MongoDB query
    const userFromDB = await usersCollection.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    console.log('User found with MongoDB query:', !!userFromDB);
    
    if (!userFromDB) {
      // For debugging, check if token exists at all regardless of expiry
      const expiredUser = await usersCollection.findOne({
        resetPasswordToken: hashedToken
      });
      
      if (expiredUser) {
        console.log('Found user but token expired:', expiredUser.email);
        const expiredDate = new Date(expiredUser.resetPasswordExpires);
        console.log('Token expired at:', expiredDate.toISOString());
        console.log('Current time:', new Date().toISOString());
        const expiredMinutes = Math.floor((new Date() - expiredDate) / 60000);
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Your password reset link has expired. Please request a new one.',
            debug: { expired: true, minutesAgo: expiredMinutes }
          },
          { status: 400 }
        );
      }
      
      console.log('No user found with this token');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token. Please request a new password reset link.' 
        },
        { status: 400 }
      );
    }

    console.log('User found, resetting password for:', userFromDB.email);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password directly with MongoDB
    const updateResult = await usersCollection.updateOne(
      { _id: userFromDB._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
      }
    );
    
    console.log('Password update result:', updateResult);
    console.log('Password reset successful');

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error processing your request. Please try again.',
        error: error.message
      },
      { status: 500 }
    );
  }
}
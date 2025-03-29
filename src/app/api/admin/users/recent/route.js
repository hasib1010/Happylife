// API Path: /api/admin/users/recent
// File Path: src/app/api/admin/users/recent/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export async function GET(request) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 5;
    
    // Fetch recent users
    const users = await User.find({})
      .select('name email role profilePicture createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      users
    });
    
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
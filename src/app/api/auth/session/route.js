import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
  try {
    // Check if JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json({
        authenticated: false,
        message: 'Server configuration error'
      }, { status: 500 });
    }

    // First try to get user from NextAuth session
    const sessionToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    let userId = null;
    let authMethod = null;

    if (sessionToken?.id) {
      userId = sessionToken.id;
      authMethod = 'nextauth';
    } else {
      // If no NextAuth session, try to get from JWT token
      const authHeader = request.headers.get('authorization');
      
      // Also check for auth token in cookies
      const cookies = request.cookies;
      const authCookie = cookies.get('auth_token');
      
      let token = null;
      
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (authCookie) {
        token = authCookie.value;
      }
      
      if (token) {
        try {
          const decoded = jwt.verify(token, jwtSecret);
          userId = decoded.id;
          authMethod = 'jwt';
        } catch (error) {
          console.error('Token verification error:', error);
          // Invalid token - don't set userId
        }
      }
    }

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated'
      });
    }
    
    await connectDB();
    
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json({
        authenticated: false,
        message: 'User not found or inactive'
      });
    }
    
    // Return user data without password
    return NextResponse.json({
      authenticated: true,
      authMethod,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        businessName: user.businessName || '',
        isSubscribed: user.isSubscribed || false,
        subscriptionStatus: user.subscriptionStatus || null,
      }
    });
  } catch (error) {
    console.error('Auth session error:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
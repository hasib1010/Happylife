// src/lib/jwt-middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * JWT authentication middleware for API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - Middleware-wrapped handler
 */
export function withAuth(handler) {
  return async (request, ...args) => {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // If no token in header, try to get from cookies
    let tokenFromCookie = null;
    const cookieHeader = request.headers.get('cookie');
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      
      if (accessTokenCookie) {
        tokenFromCookie = accessTokenCookie.split('=')[1].trim();
      }
    }
    
    // Use token from header or cookie
    const accessToken = token || tokenFromCookie;
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      
      // Add user data to request
      request.user = decoded;
      
      // Continue to the actual handler
      return handler(request, ...args);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

/**
 * Role-based authorization middleware
 * @param {Function} handler - The API route handler
 * @param {Array|String} allowedRoles - Roles that can access this route
 * @returns {Function} - Middleware-wrapped handler
 */
export function withRoles(handler, allowedRoles) {
  return withAuth(async (request, ...args) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user has required role
    if (!roles.includes(request.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Continue to the actual handler
    return handler(request, ...args);
  });
}

/**
 * Check if current user has specific permissions
 * @param {String} area - The permission area to check
 * @param {String} level - The permission level required
 * @returns {Function} - Middleware function that evaluates permissions
 */
export function checkPermission(area, level) {
  return async (request) => {
    try {
      // Make a request to the permissions API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.user ? request.user.token : ''}`
        },
        body: JSON.stringify({ area, level }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      return data.success && data.hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };
}
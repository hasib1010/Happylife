// src/lib/auth-utils.js
import { getSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * Utility to get the current user from either NextAuth or custom JWT
 * 
 * For client components, use:
 * - useSession() from next-auth/react for NextAuth
 * - useAuth() from our custom hook for custom JWT
 * 
 * This utility is for server components
 */
export async function getUser(req) {
  try {
    // First try to get the session from NextAuth
    const session = await getSession({ req });
    
    if (session?.user) {
      return session.user;
    }
    
    // If NextAuth session is not available, try our custom JWT
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        return {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          businessName: decoded.businessName,
          isSubscribed: decoded.isSubscribed
        };
      } catch (error) {
        console.error('Custom token verification failed:', error.message);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Check if user has the required role(s)
 * @param {Object} user - User object
 * @param {string|string[]} roles - Required role(s)
 * @returns {boolean} - Whether user has the required role
 */
export function hasRequiredRole(user, roles) {
  if (!user) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
}

/**
 * Check if a user has an active subscription
 * @param {Object} user - User object
 * @returns {boolean} - Whether user has an active subscription
 */
export function hasActiveSubscription(user) {
  if (!user) return false;
  
  // If the user is not a provider or seller, they don't need a subscription
  if (!['provider', 'seller'].includes(user.role)) {
    return true;
  }
  
  return user.isSubscribed === true;
}
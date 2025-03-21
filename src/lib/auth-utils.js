// src/lib/auth-utils.js
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function getServerUser(request) {
  try {
    // Extract session token from request headers if provided
    let sessionToken = null;
    
    // If request is provided, try to get the cookie from it
    if (request && request.cookies) {
      sessionToken = request.cookies.get('session_token')?.value;
    }
    
    // If no session token found, return null
    if (!sessionToken) {
      return null;
    }
    
    await connectToDatabase();
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      sessionToken: String,
      accountType: String,
      subscriptionStatus: String,
    }));
    
    const user = await User.findOne({ sessionToken });
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

// Middleware-like function to protect routes on the server
export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: { user },
  };
}
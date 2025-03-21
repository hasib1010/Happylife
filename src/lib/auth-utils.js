// src/lib/auth-utils.js
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Helper function to get the currently authenticated user on the server
export async function getServerUser() {
  try {
    // The cookies() function itself needs to be awaited, not the get method
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find user with matching session token
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
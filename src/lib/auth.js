// src/lib/auth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log("Authorization attempt with email:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing email or password in credentials");
            throw new Error('Invalid credentials');
          }

          await dbConnect();
          console.log("Database connection established");

          const user = await User.findOne({ email: credentials.email }).select('+password');
          console.log("User lookup result:", user ? `Found (${user._id})` : "Not found");
          
          if (!user) {
            console.log("No user found with email:", credentials.email);
            throw new Error('No user found with this email');
          }
          
          // Verify password exists and is a string
          if (!user.password || typeof user.password !== 'string') {
            console.log("Password issue - stored password is invalid", typeof user.password);
            throw new Error('Account password issue. Please reset your password.');
          }

          // Log password info (careful with sensitive data in production)
          console.log("Attempting password comparison");
          console.log("Password from credentials length:", credentials.password.length);
          console.log("Stored password format check:", user.password.startsWith('$2') ? "Valid bcrypt" : "Invalid format");
          
          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          console.log("Password match result:", isPasswordMatch);
          
          if (!isPasswordMatch) {
            console.log("Password comparison failed");
            throw new Error('Invalid password');
          }

          // Check if user is active
          if (!user.isActive) {
            console.log("User account is inactive");
            throw new Error('Your account is inactive. Please contact support.');
          }

          console.log("Authentication successful for:", user.email);
          
          // Return user object without password for token creation
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            businessName: user.businessName || null,
            isSubscribed: user.isSubscribed || false,
            image: user.profilePicture || null,
          };
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        console.log("JWT callback with user:", user.email);
        token.id = user.id;
        token.role = user.role;
        token.businessName = user.businessName;
        token.isSubscribed = user.isSubscribed;
        
        // Add any additional user info you need in the token
        token.email = user.email;
        token.name = user.name;
      }
      
      // On subsequent requests, you might want to refresh the user data
      // For example, checking subscription status from the database
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        console.log("Session callback for user:", token.email);
        
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.businessName = token.businessName;
        session.user.isSubscribed = token.isSubscribed;
        
        // Ensure any other needed properties are passed to the session
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Handle redirects
      console.log("Redirect callback - URL:", url, "Base URL:", baseUrl);
      
      // If the URL starts with the base URL, allow it
      if (url.startsWith(baseUrl)) return url;
      
      // Otherwise, redirect to the base URL
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin', // Redirect errors to signin page with error param
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error(`Auth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`Auth debug: ${code}`, metadata);
    },
  },
};

export default authOptions;
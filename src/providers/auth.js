// src/providers/auth.js
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Create the authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Load user from localStorage on initial render
  // and verify session with the server
  useEffect(() => {
    const loadAndVerifyUser = async () => {
      try {
        // First check if we have a stored user
        const storedUser = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');
        
        if (storedUser) {
          // Check if the login session has expired (24 hours)
          const currentTime = Date.now();
          const sessionAge = currentTime - Number(loginTime || 0);
          const sessionLifetime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (!loginTime || sessionAge > sessionLifetime) {
            // Session expired, clear storage
            console.log('Session expired, logging out');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            setUser(null);
          } else {
            // We have a potentially valid session - verify with server
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser); // Set user initially from localStorage
            
            try {
              // Verify session with the server
              const response = await fetch('/api/auth/verify-session', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  // Update user with fresh data from server
                  setUser({
                    ...parsedUser,
                    ...data.user // Merge with fresh data from server
                  });
                  localStorage.setItem('user', JSON.stringify({
                    ...parsedUser,
                    ...data.user
                  }));
                  // Refresh the login time
                  localStorage.setItem('loginTime', Date.now().toString());
                } else {
                  // Session invalid on server, clear local storage
                  localStorage.removeItem('user');
                  localStorage.removeItem('loginTime');
                  setUser(null);
                }
              } else {
                // Unable to verify with server, but keep local session for now
                console.warn('Unable to verify session with server');
              }
            } catch (verifyError) {
              // Error verifying with server, but keep local session
              console.error('Error verifying session:', verifyError);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadAndVerifyUser();
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      if (data.success && data.user) {
        // Generate a session token
        const sessionToken = uuidv4();
        
        // Store the session token on the server
        const sessionResponse = await fetch('/api/auth/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, sessionToken }),
        });
        
        if (!sessionResponse.ok) {
          throw new Error('Failed to create session');
        }
        
        // Store user in state and localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', Date.now().toString());
        setLoading(false);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear session on the server
      await fetch('/api/auth/end-session', {
        method: 'POST',
      });
      
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if server request fails
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      router.push('/');
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Function to refresh user data (useful after subscription changes)
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/auth/user');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Update user with fresh data
          const updatedUser = { ...user, ...data.user };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    isSubscribed: user?.subscriptionStatus === 'active',
    accountType: user?.accountType || 'regular',
    signIn,
    signOut,
    register,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
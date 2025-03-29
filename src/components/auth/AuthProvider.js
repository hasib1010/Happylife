'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAuthToken, setAuthToken, removeAuthToken, fetchWithAuth } from '@/lib/authUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationProcessing, setRegistrationProcessing] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!session?.user || !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          try {
            const response = await fetchWithAuth('/api/auth/verify');
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            } else {
              // Handle unauthorized or expired token
              removeAuthToken();
            }
          } catch (err) {
            console.error('Auth verification error:', err);
            setError('Failed to authenticate');
            removeAuthToken();
          }
        }
      } catch (err) {
        console.error('Auth checking error:', err);
      } finally {
        setLoading(false);
      }
    };

    // If Next Auth session is loading, wait
    if (sessionStatus === 'loading') {
      return;
    }

    // If we have a Next Auth session, use that
    if (session) {
      setUser(session.user);
      setLoading(false);
      return;
    }

    // Otherwise check for JWT token
    checkAuth();
  }, [session, sessionStatus]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      // Try to login with Next Auth credentials first
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        // If Next Auth fails, try custom JWT login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        if (data.token) {
          const maxAge = credentials.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
          setAuthToken(data.token);
        }
        
        if (data.user) {
          setUser(data.user);
        }
        
        toast.success('Successfully logged in!');
        return { success: true, user: data.user };
      }

      toast.success('Successfully logged in!');
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setRegistrationProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      if (data.token) {
        setAuthToken(data.token);
      }
      
      if (data.user) {
        setUser(data.user);
        
        // Attempt immediate login with credentials after successful signup
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });
        
        if (!loginResult.success) {
          console.warn('Auto-login after signup failed, user will need to log in manually');
        }
      }
      
      toast.success('Account created successfully!');
      return { success: true, user: data.user };
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setRegistrationProcessing(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (session) {
        await signOut({ redirect: false });
      }
      
      // Always clean up JWT token
      removeAuthToken();
      setUser(null);
      
      // Redirect to home page
      router.push('/');
      toast.success('Logged out successfully');
      return { success: true };
    } catch (err) {
      toast.error('Failed to log out');
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setUser((prevUser) => ({ ...prevUser, ...data.user }));
      toast.success('Profile updated successfully');
      return { success: true, user: data.user };
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = () => session?.user || user || null;

  const hasRole = (roles) => {
    if (!isAuthenticated) return false;
    const userRole = session?.user?.role || user?.role;
    if (!userRole) return false;
    return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
  };

  const value = {
    user: session?.user || user,
    loading: sessionStatus === 'loading' || loading,
    error,
    isAuthenticated,
    registrationProcessing,
    hasRole,
    login,
    signup,
    logout,
    updateProfile,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
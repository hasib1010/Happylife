'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAuthToken, setAuthToken, removeAuthToken, fetchWithAuth } from '@/lib/authUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const isAuthenticated = !!session?.user || !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const response = await fetchWithAuth('/api/auth/verify');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            removeAuthToken();
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setError('Failed to authenticate');
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'loading') {
      return;
    }

    if (session) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [session, sessionStatus]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
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
        localStorage.setItem('auth_token', data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Strict`;
      }
      if (data.user) {
        setUser(data.user);
      }
      toast.success('Successfully logged in!');
      
      // Hard refresh after successful login
      window.location.reload();

      return { success: true, user: data.user };
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
      }
      toast.success('Account created successfully!');
      return { success: true, user: data.user };
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (session) {
        await signOut({ redirect: false });
      }
      removeAuthToken();
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      setUser(null);
      
      // Redirect and hard refresh
      router.push('/');
      window.location.reload();

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
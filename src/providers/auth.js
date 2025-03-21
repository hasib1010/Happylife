'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Create the authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define roles for client-side use
  const ROLES = {
    REGULAR: 'regular',
    PROVIDER: 'provider',
    PRODUCT_SELLER: 'product_seller',
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  };

  // Helper to check if user has a specific role
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    
    // Convert single role to array for easier checking
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    return roles.includes(user.role);
  };
  
  // Helper to check if user has permission
  const hasPermission = (area, level) => {
    if (!user || !user.permissions) return false;
    
    const permission = user.permissions[area];
    if (!permission) return false;
    
    // Define permission hierarchy
    const levels = {
      'read_only': 1,
      'manage_own': 2,
      'manage_all': 3,
      'full_access': 4
    };
    
    return levels[permission] >= levels[level];
  };

  // Check if user is authenticated on initial render
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me', {
          credentials: 'include' // Important: Include cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          // If 401 or other error, user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    
    // Set up interval to refresh access token
    const refreshInterval = setInterval(async () => {
      if (user) {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (!response.ok) {
            // If refresh fails, log out the user
            setUser(null);
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If refresh fails, log out the user
          setUser(null);
          router.push('/auth/login');
        }
      }
    }, 45 * 60 * 1000); // Refresh every 45 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.success && data.user) {
        setUser(data.user);
        
        // Determine redirect based on user role
        let redirectPath = '/dashboard';
        
        if (['admin', 'super_admin', 'manager'].includes(data.user.role)) {
          redirectPath = '/admin/dashboard';
        } else if (data.user.role === 'provider') {
          redirectPath = '/dashboard/provider';
        } else if (data.user.role === 'product_seller') {
          redirectPath = '/dashboard/products';
        }
        
        // Check for callbackUrl in query params
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl');
        
        return {
          success: true,
          redirectPath: callbackUrl || redirectPath
        };
      } else {
        setUser(null);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      router.push('/auth/login');
      
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update user state with new data
      setUser({
        ...user,
        ...data.user
      });
      
      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    ROLES,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword
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
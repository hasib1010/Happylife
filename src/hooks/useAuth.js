'use client';
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if the user is logged in on initial load
  useEffect(() => {
    async function loadUserFromLocalStorage() {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromLocalStorage();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save user to state and localStorage
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('user');
      
      // Redirect to home/login page
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get current auth state
  const isAuthenticated = !!user;

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Create a higher-order component for protected routes
export function withAuth(Component, roles = null) {
  return function ProtectedRoute(props) {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/auth/signin');
      } else if (roles && !loading && isAuthenticated && !hasRole(roles)) {
        router.push('/dashboard');
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (roles && !hasRole(roles)) {
      return null;
    }

    return <Component {...props} />;
  };
}
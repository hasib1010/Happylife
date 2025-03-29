'use client';
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on initial render (client-side only)
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if user has specific role(s)
  const hasRole = (role) => {
    if (!user?.role) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Check authentication status
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth(Component, requiredRoles) {
  return function ProtectedRoute(props) {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/auth/signin');
        } else if (requiredRoles && !hasRole(requiredRoles)) {
          router.push('/unauthorized');
        }
      }
    }, [loading, isAuthenticated, router, requiredRoles]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated || (requiredRoles && !hasRole(requiredRoles))) {
      return null; // Redirect will happen in useEffect
    }

    return <Component {...props} />;
  };
}

// Client-side only wrapper
export function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? children : null;
}
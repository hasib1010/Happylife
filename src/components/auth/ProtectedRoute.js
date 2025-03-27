'use client';
// src/components/auth/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], // Array of allowed roles, empty means any authenticated user
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the authentication is still loading
    if (status === 'loading') {
      return;
    }

    // Check if user is authenticated
    if (status !== 'authenticated') {
      // Redirect to login page if not authenticated
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check if the user has the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      // Redirect to unauthorized page if user doesn't have the required role
      router.push('/unauthorized');
      return;
    }

    // If we get here, the user is authorized
    setAuthorized(true);
  }, [status, session, router, pathname, allowedRoles]);

  // Show loading indicator while checking authentication
  if (status === 'loading' || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render children if authorized
  return children;
}
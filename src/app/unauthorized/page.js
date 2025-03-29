'use client';
// src/app/unauthorized/page.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, ClientOnly } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';

function UnauthorizedContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const [countdown, setCountdown] = useState(5);

  // Combine loading states
  const isLoading = authLoading || sessionStatus === 'loading';

  // Get user from either auth system
  const authUser = user || session?.user;

  useEffect(() => {
    if (isLoading) return;

    // Redirect after countdown completes
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(authUser ? '/dashboard' : '/');
    }
  }, [countdown, isLoading, router, authUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
          <svg 
            className="mx-auto h-16 w-16 text-red-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-base text-gray-600">
            You don't have permission to access this area.
          </p>
          
          {authUser && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Your current role: <span className="font-medium">{authUser.role}</span>
              </p>
              {authUser.isSubscribed === false && (
                <p className="text-sm text-gray-600 mt-1">
                  Subscription status: <span className="font-medium text-red-500">Inactive</span>
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">What to do next?</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  {authUser?.role === 'provider' || authUser?.role === 'seller' 
                    ? "This area requires an active subscription or different account type."
                    : "This area is restricted to authorized users only."}
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {(authUser?.role === 'provider' || authUser?.role === 'seller') && !authUser?.isSubscribed && (
                  <Link 
                    href="/subscription"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Upgrade Subscription
                  </Link>
                )}
                <Link
                  href={authUser ? '/dashboard' : '/'}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {authUser ? 'Go to Dashboard' : 'Return Home'} 
                  <span className="ml-2 text-gray-400">({countdown})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <ClientOnly>
      <UnauthorizedContent />
    </ClientOnly>
  );
}
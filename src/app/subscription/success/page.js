'use client';
// src/app/subscription/success/page.js
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      if (!sessionId) {
        setError('Invalid session');
        setIsLoading(false);
        return;
      }

      // Verify session with the server
      const verifySession = async () => {
        try {
          const response = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to verify subscription');
          }

          setIsLoading(false);
        } catch (error) {
          setError(error.message);
          setIsLoading(false);
        }
      };

      verifySession();
    }
  }, [sessionId, router, status, session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-2 text-lg font-medium text-gray-900">Error</h2>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link
                href="/subscription"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Subscription Successful!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Thank you for subscribing to HappyLife.Services. Your account is now active.
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Next Steps</h3>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <span>1</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">Complete your profile</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Add your business details, photos, and contact information to make your profile stand out.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <span>2</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">
                  Add your {session?.user?.role === 'provider' ? 'services' : 'products'}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Create detailed listings of what you offer with descriptions, pricing, and images.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <span>3</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">Start receiving inquiries</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Once your profile is live, clients can find you and reach out directly through our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Profile
          </Link>
          <Link
            href={session?.user?.role === 'provider' ? '/services/manage' : '/products/manage'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {session?.user?.role === 'provider' ? 'Add Services' : 'Add Products'}
          </Link>
        </div>
      </div>
    </div>
  );
}
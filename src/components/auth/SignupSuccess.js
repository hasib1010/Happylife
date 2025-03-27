'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function SignupSuccess({ user }) {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect immediately
    if (isAuthenticated) {
      if (user?.role === 'provider' || user?.role === 'seller') {
        router.push('/subscription');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // Otherwise, set up countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/signin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isAuthenticated, user]);

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Account Created Successfully!</h2>
      </div>
      <div className="px-6 py-8">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="text-center text-gray-600 mb-6">
          Your account has been created successfully. Please sign in to continue.
        </p>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Redirecting to login page in {countdown} seconds...
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <Link
            href="/auth/signin"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 text-center"
          >
            Sign In Now
          </Link>
          {(user?.role === 'provider' || user?.role === 'seller') && (
            <Link
              href="/subscription"
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              Set Up Subscription
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
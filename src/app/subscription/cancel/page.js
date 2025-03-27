'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';

export default function SubscriptionCancelPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, hasRole } = useAuth();

  // Check authentication and role
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/subscription/cancel');
    }
    if (!authLoading && user && !hasRole(['provider', 'seller'])) {
      toast.error('This page is only for providers and sellers');
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, hasRole, router]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || (user && !hasRole(['provider', 'seller']))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Subscription Not Completed
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            It looks like you didn’t complete your subscription purchase.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 text-center">
            <p className="text-gray-700 mb-6">
              No worries! You haven’t been charged, and you can still explore HappyLife Services as a user for free. If you’d like to list your{' '}
              {user.role === 'provider' ? 'services' : 'products'} as a {user.role === 'provider' ? 'provider' : 'seller'}, you can try subscribing again.
            </p>
            <div className="space-y-4">
              <Link
                href="/subscription"
                className="inline-block w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white py-3 px-4 rounded-md font-medium"
              >
                Try Subscribing Again
              </Link>
              <Link
                href="/dashboard"
                className="inline-block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-700">
              Need help? Reach out via our{' '}
              <Link href="/contact" className="text-teal-600 hover:text-teal-800">
                Contact Page
              </Link>{' '}
              or review our{' '}
              <Link href="/terms-of-service" className="text-teal-600 hover:text-teal-800">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-800">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
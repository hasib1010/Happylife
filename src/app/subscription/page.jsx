'use client';
// src/app/subscription/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication and redirect if necessary
  useEffect(() => {
    // If not logged in after loading finishes, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/subscription');
    }
    
    // If user is not a provider or seller, redirect to dashboard
    if (!loading && user && !hasRole(['provider', 'seller'])) {
      toast.error('This page is only for providers and sellers');
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, hasRole, router]);

  // Handler for subscription button
  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      setError(error.message);
      toast.error(`Subscription error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role
  if (!isAuthenticated || (user && !hasRole(['provider', 'seller']))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Join our directory as a {user.role === 'provider' ? 'Provider' : 'Seller'}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Connect with clients seeking health and wellness services on our platform.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-baseline">
              <h2 className="text-2xl font-bold text-gray-900">Monthly Subscription</h2>
              <span className="ml-2 py-1 px-2 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                Most Popular
              </span>
            </div>
            <div className="mt-4 flex items-baseline text-teal-600">
              <span className="text-5xl font-extrabold tracking-tight">$20</span>
              <span className="ml-1 text-2xl font-medium">/month</span>
            </div>
            <p className="mt-5 text-gray-500">
              Everything you need to showcase your {user.role === 'provider' ? 'services' : 'products'} to potential clients.
            </p>

            <div className="mt-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  Featured listing in our directory
                </p>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  Detailed profile page with reviews
                </p>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  Multiple {user.role === 'provider' ? 'service' : 'product'} listings
                </p>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  Analytics and insights
                </p>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  Priority support
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </button>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-2 text-xs text-gray-500 text-center">
                Secure payment processed by Stripe
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-700">
              By subscribing, you agree to our {' '}
              <Link href="/terms-of-service" className="text-teal-600 hover:text-teal-800">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-800">
                Privacy Policy
              </Link>
              . You can cancel anytime from your account settings.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            <div className="pt-6">
              <dt className="text-base font-medium text-gray-900">
                What happens after I subscribe?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                After subscribing, you'll be able to create your profile and add your {user.role === 'provider' ? 'services' : 'products'} to our directory immediately.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-base font-medium text-gray-900">
                Can I cancel my subscription?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-base font-medium text-gray-900">
                Are there any setup fees?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                No, there are no setup fees. You only pay the monthly subscription fee of $20.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
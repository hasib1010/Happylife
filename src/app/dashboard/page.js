'use client';
// src/app/dashboard/page.js
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';

export default function Dashboard() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Renamed for clarity
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    listings: 0,
    views: 0,
    inquiries: 0,
    
  });
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (hasFetched || !session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();

      if (data.success) {
        setUserData(data.user);

        // Set mock stats based on role
        if (data.user.role === 'provider') {
          setStats({
            listings: Math.floor(Math.random() * 5),
            views: Math.floor(Math.random() * 100),
            inquiries: Math.floor(Math.random() * 10),
            reviews: Math.floor(Math.random() * 5),
          });
        } else if (data.user.role === 'seller') {
          setStats({
            listings: Math.floor(Math.random() * 10),
            views: Math.floor(Math.random() * 200),
            orders: Math.floor(Math.random() * 10),
            reviews: Math.floor(Math.random() * 8),
          });
        } else {
          setStats({
            saved: Math.floor(Math.random() * 8),
            viewed: Math.floor(Math.random() * 25),
            messages: Math.floor(Math.random() * 3),
            reviews: Math.floor(Math.random() * 2),
          });
        }
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [session?.user?.id, hasFetched]);

  // Effect to fetch user data when session is ready
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setIsLoading(true); // Keep loading while session is initializing
      return;
    }

    if (session?.user?.id && !hasFetched) {
      fetchUserData();
    } else if (!session) {
      setIsLoading(false); // No session, stop loading
    }
  }, [session, sessionStatus, fetchUserData, hasFetched]);

  // Manual refresh for debugging
  const handleManualRefresh = async () => {
    setHasFetched(false);
    setIsLoading(true);
    await fetchUserData();
  };

  // Loading state when session is still initializing or data is fetching
  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // No session (user not signed in)
  if (!session) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to HappyLife.Services</h1>
          <p className="text-lg text-gray-600 mb-8">Please sign in to access your dashboard.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state when user data fails to load
  if (!userData && !isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unable to load your profile</h2>
          <p className="text-gray-600 mb-6">We couldn't load your profile data. Please try again.</p>
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const isProvider = userData?.role === 'provider';
  const isSeller = userData?.role === 'seller';
  const isAdmin = userData?.role === 'admin';
  const isPremiumUser = isProvider || isSeller;
  const isSubscribed = userData?.isSubscribed;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {userData?.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isProvider && 'Manage your service listings and connect with potential clients.'}
              {isSeller && 'Manage your product listings and track your orders.'}
              {!isPremiumUser && 'Explore health and wellness services and products.'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {isPremiumUser && (
              <Link
                href={isProvider ? '/services/create' : '/products/create'}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isProvider ? 'Add New Service' : 'Add New Product'}
              </Link>
            )}
            <button
              onClick={handleManualRefresh}
              className="ml-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        {isPremiumUser && !isSubscribed && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your account is not active. Subscribe to list your {isProvider ? 'services' : 'products'}.
                  <Link href="/subscription" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                    Subscribe now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {isPremiumUser && isSubscribed && (
          <div className="mb-6">
            <SubscriptionStatus />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {isProvider ? 'Active Services' : isSeller ? 'Active Products' : 'Saved Items'}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isProvider || isSeller ? stats.listings : stats.saved}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href={isProvider ? '/services/manage' : isSeller ? '/products/manage' : '/favorites'}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Profile Views</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isPremiumUser ? stats.views : stats.viewed}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/analytics" className="font-medium text-blue-600 hover:text-blue-500">
                    View analytics
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {isProvider ? 'Inquiries' : isSeller ? 'Orders' : 'Messages'}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isProvider ? stats.inquiries : isSeller ? stats.orders : stats.messages || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/messages" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Reviews</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.reviews || 0}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/reviews" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isPremiumUser && (
              <>
                <Link href="/profile/edit" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">Update Profile</h3>
                        <div className="mt-1 text-sm text-gray-500">Keep your business information up to date</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href={isProvider ? '/services/manage' : '/products/manage'} className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">Manage Listings</h3>
                        <div className="mt-1 text-sm text-gray-500">Edit or update your {isProvider ? 'services' : 'products'}</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href={isSubscribed ? '/subscription/manage' : '/subscription'} className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">{isSubscribed ? 'Manage Subscription' : 'Subscribe Now'}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {isSubscribed ? 'Update your payment methods or plan' : `Subscribe to list your ${isProvider ? 'services' : 'products'}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {!isPremiumUser && (
              <>
                <Link href="/services" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">Explore Services</h3>
                        <div className="mt-1 text-sm text-gray-500">Find health and wellness providers</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/products" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">Browse Products</h3>
                        <div className="mt-1 text-sm text-gray-500">Discover wellness products</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/profile/edit" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600">Update Profile</h3>
                        <div className="mt-1 text-sm text-gray-500">Manage your account settings</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {!isPremiumUser && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg">
            <div className="px-6 py-10 sm:px-10">
              <h3 className="text-xl font-medium text-white">Become a Provider or Seller</h3>
              <div className="mt-2 text-sm text-purple-100">
                <p>List your services or products on our platform and connect with customers seeking health and wellness solutions.</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/subscription/choose"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-purple-600 bg-white hover:bg-purple-50"
                >
                  Upgrade your account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
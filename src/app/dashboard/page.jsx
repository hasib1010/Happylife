'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, hasRole } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Check if this is a new registration (from URL param)
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  
  useEffect(() => {
    // Check URL or localStorage for new registration flag
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const newReg = urlParams.get('newRegistration') === 'true';
      const storedNewReg = localStorage.getItem('newRegistration') === 'true';
      
      if (newReg || storedNewReg) {
        setIsNewRegistration(true);
        // Clean up
        localStorage.removeItem('newRegistration');
        // Remove from URL if present
        if (newReg && window.history.replaceState) {
          const newUrl = window.location.pathname;
          window.history.replaceState({path: newUrl}, '', newUrl);
        }
      }
    }
  }, []);

  // Fetch user data and related stats
  const fetchDashboardData = useCallback(async () => {
    if (hasFetched || !isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // If this is a new registration, use the auth context user data first
      // to show something immediately, even before API calls complete
      if (isNewRegistration && user) {
        setUserData({
          ...user,
          isSubscribed: user.isSubscribed || false
        });
        
        // Set basic stats
        setDashboardStats({
          listings: 0,
          views: 0,
          inquiries: 0,
          orders: 0,
          messages: 0,
          saved: 0,
          viewed: 0,
          reviews: 0,
        });
      }

      // Try fetching user profile data with error handling for new registrations
      try {
        const userResponse = await fetchWithAuth('/api/user/dashboard');
        
        if (userResponse.ok) {
          const userProfileData = await userResponse.json();
          
          if (userProfileData.success) {
            setUserData({
              ...userProfileData.user,
              // We'll update subscription status after fetching that data
            });
            
            // Use stats from userData as fallback
            setDashboardStats(userProfileData.stats || {
              listings: 0,
              views: 0,
              inquiries: 0,
              orders: 0,
              messages: 0,
              saved: 0,
              viewed: 0,
              reviews: 0,
            });
          }
        } else {
          // For new registrations, handle this gracefully without throwing
          if (isNewRegistration) {
            console.warn('User dashboard API returned non-OK status for new registration:', userResponse.status);
          } else {
            throw new Error('Failed to fetch user profile');
          }
        }
      } catch (userError) {
        // For new registrations, handle this gracefully
        if (isNewRegistration) {
          console.warn('Error fetching user profile for new registration:', userError);
        } else {
          throw userError; // Re-throw for normal dashboard loads
        }
      }

      // Try fetching subscription status separately
      try {
        const subscriptionResponse = await fetchWithAuth('/api/subscription/status');
        
        if (subscriptionResponse.ok) {
          const subData = await subscriptionResponse.json();
          setSubscriptionData(subData);
          
          // Update user data with subscription status
          setUserData(prevData => {
            if (!prevData && user) {
              // If we don't have userData yet but have auth user
              return {
                ...user,
                isSubscribed: subData.isActive
              };
            } else if (prevData) {
              // Update existing userData
              return {
                ...prevData,
                isSubscribed: subData.isActive
              };
            }
            return prevData;
          });
        }
      } catch (subError) {
        console.warn('Error fetching subscription status:', subError);
        // Don't throw, continue with what we have
      }
      
      // If we still don't have userData at this point, but we have user from auth context,
      // use that as a fallback to avoid showing the error screen
      if (!userData && user) {
        setUserData({
          ...user,
          isSubscribed: subscriptionData?.isActive || false
        });
      }
      
      // If we have any user data at all, mark as fetched
      if (userData || user) {
        setHasFetched(true);
      } else if (!isNewRegistration) {
        // Only throw this error for non-new registrations
        throw new Error('Unable to load user profile data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // For new registrations, don't show error toast on first attempt
      if (!isNewRegistration) {
        setError(err.message);
        toast.error(`Error loading dashboard: ${err.message}`);
      } else {
        // For new registrations, set a more helpful error message
        setError('Your account is being set up. Please try refreshing in a moment.');
      }
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [isAuthenticated, hasFetched, user, userData, isNewRegistration, subscriptionData]);

  // Effect to fetch user data when auth is ready
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (isAuthenticated && !hasFetched) {
      // For new registrations, add a slight delay to allow auth to settle
      if (isNewRegistration) {
        const timer = setTimeout(() => {
          fetchDashboardData();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        fetchDashboardData();
      }
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchDashboardData, hasFetched, isNewRegistration]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setHasFetched(false);
    setIsNewRegistration(false); // Turn off special handling on manual refresh
    await fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  // Loading state
  if (authLoading || (isLoading && !userData)) {
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

  // Not signed in
  if (!isAuthenticated) {
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

  // Get the best available user data
  const effectiveUser = userData || user;
  
  // Error state - only if we have no user data at all
  if (!effectiveUser) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unable to load your profile</h2>
          <p className="text-gray-600 mb-6">{error || "We couldn't load your profile data. Please try again."}</p>
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

  // User role and status checks - using the effective user data
  const isProvider = effectiveUser.role === 'provider' || hasRole('provider');
  const isSeller = effectiveUser.role === 'seller' || hasRole('seller');
  const isAdmin = effectiveUser.role === 'admin' || hasRole('admin');
  const isPremiumUser = isProvider || isSeller;
  
  // Get subscription status from the best available source
  const isSubscribed = effectiveUser.isSubscribed || subscriptionData?.isActive;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {effectiveUser.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isProvider && 'Manage your service listings and connect with potential clients.'}
              {isSeller && 'Manage your product listings and track your orders.'}
              {!isPremiumUser && 'Explore health and wellness services and products.'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {isPremiumUser && isSubscribed && (
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

        {/* New registration welcome message */}
        {isNewRegistration && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your account has been created successfully! Welcome to HappyLife.Services.
                  {isPremiumUser && !isSubscribed && ' Complete your setup by subscribing below.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription notice for premium users without subscription */}
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

        {/* Subscription status for subscribed premium users */}
        {isPremiumUser && isSubscribed && (
          <div className="mb-6">
            <SubscriptionStatus />
          </div>
        )}

        {/* Error display */}
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
                {isNewRegistration && (
                  <p className="text-xs text-red-600 mt-1">Your account is being set up. Try refreshing the page.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats overview section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* First stat card */}
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
                          {isProvider || isSeller ? dashboardStats.listings || 0 : dashboardStats.saved || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href={isProvider ? '/dashboard/services/' : isSeller ? '/dashboard/products/' : '/favorites'}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>

           {/* Additional stat cards would go here */}
           
          </div>
        </div>

        {/* Quick actions section */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Provider/Seller specific actions */}
            {isPremiumUser && (
              <>
                <Link href="/profile" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
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

                <Link href={isProvider ? '/dashboard/services' : '/dashboard/products'} className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
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

            {/* Regular user specific actions */}
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

                <Link href="/profile" className="block hover:bg-gray-50 bg-white shadow rounded-lg overflow-hidden">
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

        {/* Upgrade account banner for regular users */}
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
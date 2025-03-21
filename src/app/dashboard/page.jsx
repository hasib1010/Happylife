// src/app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PenLine, 
  ShoppingBag, 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  Loader2,
  ArrowRight,
  CreditCard,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isSubscribed, accountType, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    providers: [],
    products: [],
    blogs: [],
    bookings: []
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/dashboard');
    } else if (!loading && isAuthenticated) {
      // User is authenticated, fetch dashboard data
      fetchDashboardData();
      
      // If subscribed, also fetch subscription details
      if (isSubscribed) {
        fetchSubscriptionDetails();
      }
    }
  }, [loading, isAuthenticated, isSubscribed, router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // This is a placeholder. In a real application, you would fetch actual data
      // from your API endpoints based on the user type
      
      // For now, set mock data
      setDashboardData({
        providers: [],
        products: [],
        blogs: [],
        bookings: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    setSubscriptionLoading(true);
    try {
      const response = await fetch('/api/subscriptions/status');
      
      // Handle 401 Unauthorized errors gracefully (occurs due to cookie issue)
      if (response.status === 401) {
        console.log('Unable to fetch subscription data: unauthorized');
        // We'll use the subscription status from useAuth() instead
        setSubscriptionInfo({
          hasSubscription: isSubscribed,
          subscription: {
            status: 'active',
            plan: accountType,
            autoRenew: true,
          }
        });
        return;
      }
      
      const data = await response.json();

      if (response.ok) {
        setSubscriptionInfo(data.data);
      } else {
        console.error('Failed to fetch subscription data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      // Fallback to basic subscription info from auth context
      setSubscriptionInfo({
        hasSubscription: isSubscribed,
        subscription: {
          status: 'active',
          plan: accountType,
        }
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show placeholder while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900">Please sign in to access your dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  // If no subscription, show upgrade prompt
  if (!isSubscribed) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white overflow-hidden shadow">
          <div className="bg-emerald-50 px-4 py-5 sm:px-6 border-b border-emerald-100">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-emerald-100 p-3 mb-4">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome, {user?.name || 'User'}</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              To unlock all features and start listing your wellness services or products, you need to subscribe to our platform.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center rounded-md bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="text-base font-medium text-gray-900 mb-3">Preview of Premium Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex items-center mb-2">
                  <PenLine className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="font-medium">Service Listings</h4>
                </div>
                <p className="text-sm text-gray-600">Create and manage your wellness services</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex items-center mb-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="font-medium">Product Catalog</h4>
                </div>
                <p className="text-sm text-gray-600">Showcase your wellness products</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="font-medium">Blog Publishing</h4>
                </div>
                <p className="text-sm text-gray-600">Share your expertise through articles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {accountType === 'provider' ? 'provider services' : 'product listings'} and content
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={signOut}
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 mr-2"
          >
            Sign Out
          </button>
          <Link
            href={accountType === 'provider' ? "/dashboard/provider/new" : "/dashboard/products/new"}
            className="ml-3 inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {accountType === 'provider' ? (
              <>
                <PenLine className="-ml-0.5 mr-1.5 h-5 w-5" />
                Add Service
              </>
            ) : (
              <>
                <ShoppingBag className="-ml-0.5 mr-1.5 h-5 w-5" />
                Add Product
              </>
            )}
          </Link>
        </div>
      </div>

      {/* Subscription Status Card */}
      {subscriptionInfo && (
        <div className="mb-6 bg-white overflow-hidden shadow rounded-lg border border-emerald-100">
          <div className="bg-emerald-50 px-4 py-4 border-b border-emerald-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Subscription Status</h2>
              <p className="text-sm text-gray-600">Your current plan details</p>
            </div>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Manage Subscription <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="px-4 py-4">
            {subscriptionLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Plan</h3>
                    <p className="text-sm text-gray-900 mt-1">
                      {subscriptionInfo?.subscription?.plan === 'provider' ? 'Service Provider' : 'Product Seller'} ($20.00/month)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Next Renewal</h3>
                    <p className="text-sm text-gray-900 mt-1">
                      {subscriptionInfo?.subscription?.currentPeriodEnd ? 
                        new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                      {subscriptionInfo?.subscription?.daysUntilRenewal && (
                        <span className="ml-1 text-gray-500">
                          ({subscriptionInfo.subscription.daysUntilRenewal} days)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Status</h3>
                    <p className="text-sm mt-1">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscriptionInfo?.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 
                          subscriptionInfo?.subscription?.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscriptionInfo?.subscription?.status === 'active' ? 'Active' : 
                         subscriptionInfo?.subscription?.status === 'past_due' ? 'Payment Past Due' : 
                         subscriptionInfo?.subscription?.status === 'canceled' ? 'Canceled' : 
                         subscriptionInfo?.subscription?.status || 'Unknown'}
                      </span>
                      {!subscriptionInfo?.subscription?.autoRenew && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Auto-renewal disabled)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Warning alert for past due or canceled status */}
          {subscriptionInfo?.subscription?.status === 'past_due' && (
            <div className="mx-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your subscription payment is past due. Please update your payment method to avoid losing access.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {subscriptionInfo?.subscription?.status === 'canceled' && (
            <div className="mx-4 mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Your subscription has been canceled and will end on {subscriptionInfo?.subscription?.currentPeriodEnd 
                      ? new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString() 
                      : 'the end of your billing period'}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                {accountType === 'provider' ? (
                  <PenLine className="h-6 w-6 text-emerald-600" />
                ) : (
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {accountType === 'provider' ? 'My Services' : 'My Products'}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {accountType === 'provider' 
                        ? (dashboardData.providers[0]?.servicesOffered?.length || 0)
                        : dashboardData.products.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href={accountType === 'provider' ? "/dashboard/provider" : "/dashboard/products"}
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Blogs
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardData.blogs.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/blogs"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        {accountType === 'provider' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Bookings
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {dashboardData.bookings.filter(b => b.status === 'confirmed').length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/dashboard/bookings"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                <Settings className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Account
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {accountType === 'provider' ? 'Provider' : 'Product Seller'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/profile"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No recent activity. Start creating content to see it here.
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function SubscriptionPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [managementSuccess, setManagementSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/dashboard/subscription');
    } else if (!loading && isAuthenticated) {
      fetchSubscriptionStatus();
    }
  }, [loading, isAuthenticated, router]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/subscriptions/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubscriptionInfo(data.data);
        
        // If no subscription, redirect to subscribe page
        if (!data.data.hasSubscription) {
          router.push('/subscribe');
        }
      } else {
        setError(data.message || 'Failed to load subscription information');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manage subscription
  const handleManageSubscription = async () => {
    setRedirecting(true);
    setError('');
    
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: window.location.origin + '/dashboard/subscription?managed=true'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Redirect to Stripe customer portal
        window.location.href = data.data.url;
      } else {
        setError(data.message || 'Failed to open subscription management portal');
        setRedirecting(false);
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      setError('Failed to open subscription management portal. Please try again.');
      setRedirecting(false);
    }
  };

  // Check URL params for management success
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('managed') === 'true') {
        setManagementSuccess(true);
        // Refresh subscription data
        fetchSubscriptionStatus();
        // Clear the URL parameter
        window.history.replaceState({}, document.title, '/dashboard/subscription');
      }
    }
  }, []);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Subscription Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your subscription details
          </p>
        </div>
      </div>
      
      {/* Success message for returning from Stripe portal */}
      {managementSuccess && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Subscription updated successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your subscription changes have been applied.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription info card */}
      {!isLoading && subscriptionInfo?.hasSubscription && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscription Details
            </h3>
            
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Plan</h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {subscriptionInfo.subscription.plan === 'provider' ? 'Service Provider' : 'Product Seller'}
                </p>
                <p className="text-sm font-medium text-emerald-600">
                  $20.00/month
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Billing Period</h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Current period ends:
                </p>
                <p className="text-sm">
                  {new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString()} 
                  {subscriptionInfo.subscription.daysUntilRenewal && (
                    <span className="ml-1 text-gray-500">
                      ({subscriptionInfo.subscription.daysUntilRenewal} days)
                    </span>
                  )}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Status</h4>
                </div>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscriptionInfo.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscriptionInfo.subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                      subscriptionInfo.subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {subscriptionInfo.subscription.status === 'active' ? 'Active' :
                      subscriptionInfo.subscription.status === 'past_due' ? 'Payment Past Due' :
                      subscriptionInfo.subscription.status === 'canceled' ? 'Canceled' :
                      subscriptionInfo.subscription.status}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {subscriptionInfo.subscription.cancelAtPeriodEnd ? 
                    'Cancels at period end' : 
                    'Renews automatically'}
                </p>
              </div>
            </div>
            
            {/* Warning messages for different statuses */}
            {subscriptionInfo.subscription.status === 'past_due' && (
              <div className="mt-6 rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your subscription payment is past due. Please update your payment method to avoid losing access to your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {subscriptionInfo.subscription.cancelAtPeriodEnd && (
              <div className="mt-6 rounded-md bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your subscription is set to cancel at the end of the current billing period on {new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString()}.
                      You can reactivate your subscription before this date to maintain uninterrupted access.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Management buttons */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleManageSubscription}
                disabled={redirecting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={fetchSubscriptionStatus}
                disabled={isLoading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment history section (placeholder) */}
      <div className="mt-10">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Payment History
        </h3>
        <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {/* For now, just show a placeholder message. In a real app, fetch payment history */}
            <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Payment history will appear here once available.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
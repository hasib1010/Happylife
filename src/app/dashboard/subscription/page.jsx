// src/app/dashboard/subscription/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { 
  CreditCard, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  AlertTriangle, 
  Check, 
  Loader2 
} from 'lucide-react';

export default function SubscriptionManagementPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/dashboard/subscription');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!isAuthenticated || loading) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/subscriptions/status');
        const data = await response.json();

        if (response.ok) {
          setSubscriptionData(data.data);
        } else {
          setError(data.message || 'Failed to fetch subscription data');
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('An error occurred while loading your subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [isAuthenticated, loading]);

  // Toggle auto-renewal
  const handleToggleAutoRenew = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch('/api/subscriptions/toggle-auto-renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRenew: !subscriptionData.subscription.autoRenew,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        // Update local state
        setSubscriptionData(prev => ({
          ...prev,
          subscription: {
            ...prev.subscription,
            autoRenew: data.data.autoRenew,
            cancelAtPeriodEnd: data.data.cancelAtPeriodEnd,
          }
        }));
      } else {
        setError(data.message || 'Failed to update auto-renewal settings');
      }
    } catch (err) {
      console.error('Error updating auto-renewal:', err);
      setError('An error occurred while updating your subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (immediately = false) => {
    if (!confirm(`Are you sure you want to cancel your subscription${immediately ? ' immediately' : ' at the end of the billing period'}?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelImmediately: immediately,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        
        // Refresh subscription data
        const statusResponse = await fetch('/api/subscriptions/status');
        const statusData = await statusResponse.json();
        
        if (statusResponse.ok) {
          setSubscriptionData(statusData.data);
        }
        
        // If canceled immediately, redirect to dashboard after a short delay
        if (immediately) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        setError(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('An error occurred while canceling your subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900">Please sign in to access your subscription</h2>
          <p className="mt-2 text-sm text-gray-500">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  if (!subscriptionData?.hasSubscription) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">No Active Subscription</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>You don't currently have an active subscription.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => router.push('/subscribe')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-sm"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { subscription } = subscriptionData;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Subscription Management</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Details Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-emerald-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Subscription Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Your HappyLife.Services subscription information.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                    subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.status === 'active' ? 'Active' : 
                   subscription.status === 'past_due' ? 'Payment Past Due' : 
                   subscription.status === 'canceled' ? 'Canceled' : 
                   subscription.status}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.plan === 'provider' ? 'Service Provider' : 'Product Seller'} ($20.00/month)
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Renewal Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()} 
                <span className="ml-2 text-gray-500">
                  ({subscription.daysUntilRenewal} {subscription.daysUntilRenewal === 1 ? 'day' : 'days'} remaining)
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Auto-Renewal</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  {subscription.autoRenew ? (
                    <>
                      <ToggleRight className="h-5 w-5 text-emerald-600 mr-2" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                      <span>Disabled</span>
                    </>
                  )}
                  
                  <button
                    onClick={handleToggleAutoRenew}
                    disabled={isUpdating}
                    className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                        Updating...
                      </>
                    ) : (
                      subscription.autoRenew ? 'Disable' : 'Enable'
                    )}
                  </button>
                </div>
                
                {!subscription.autoRenew && (
                  <p className="mt-2 text-sm text-gray-500">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()} and will not be renewed.
                  </p>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Subscription History</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>
                    Renewal count: {subscription.renewalCount || 0} {subscription.renewalCount === 1 ? 'time' : 'times'}
                  </span>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Actions */}
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Manage Subscription</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Make changes to your subscription or cancel it if needed.</p>
          </div>
          <div className="mt-5 space-y-4">
            {!subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => handleCancelSubscription(false)}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Cancel at Renewal Date'
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={() => handleCancelSubscription(true)}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                'Cancel Immediately'
              )}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>Immediate cancellation will end your subscription now and remove your provider/seller privileges.</p>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Frequently Asked Questions</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="space-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-900">What happens when I disable auto-renewal?</dt>
              <dd className="mt-1 text-sm text-gray-500">
                Your subscription will remain active until the current billing period ends. After that, your subscription will expire and you'll lose access to provider/seller features.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-900">Can I reactivate my subscription after canceling?</dt>
              <dd className="mt-1 text-sm text-gray-500">
                Yes, you can subscribe again at any time. However, you may need to set up your provider profile or product listings again.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-900">Will I get a refund if I cancel my subscription?</dt>
              <dd className="mt-1 text-sm text-gray-500">
                We don't provide refunds for partial months. If you cancel, you'll maintain access until the end of your current billing period.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
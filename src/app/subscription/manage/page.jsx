'use client';
// src/app/subscription/manage/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SubscriptionManage() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'seller']}>
      <ManageSubscriptionContent />
    </ProtectedRoute>
  );
}

function ManageSubscriptionContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  const isProvider = session?.user?.role === 'provider';
  const isSeller = session?.user?.role === 'seller';
  
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/subscription/status');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }
        
        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (session && (isProvider || isSeller)) {
      fetchSubscriptionStatus();
    }
  }, [session, isProvider, isSeller]);
  
  const handleCreatePortalSession = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      
      const data = await response.json();
      
      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError(err.message);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }
    
    try {
      setCancelling(true);
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Your subscription has been canceled. You will still have access until the end of your current billing period.');
        
        // Refresh subscription data
        const statusResponse = await fetch('/api/subscription/status');
        const statusData = await statusResponse.json();
        setSubscriptionData(statusData);
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect if not subscribed
  if (subscriptionData && !subscriptionData.isActive) {
    router.push('/subscription');
    return null;
  }
  
  const { subscription, user } = subscriptionData || {};
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Subscription</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your subscription settings.
          </p>
        </div>
        
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
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscription Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Information about your current plan.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isProvider ? 'Provider' : 'Seller'} Monthly Subscription
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user?.subscriptionStatus?.charAt(0).toUpperCase() + user?.subscriptionStatus?.slice(1) || 'Active'}
                  </span>
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Started On</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user?.subscriptionStart)}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Current Period Ends</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user?.subscriptionEnd)}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">$20.00 / month</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Auto Renew</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {subscription?.cancelAtPeriodEnd ? 'No' : 'Yes'}
                </dd>
              </div>
            </dl>
            
            {subscription?.cancelAtPeriodEnd && (
              <div className="mt-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your subscription is set to cancel at the end of the current billing period on {formatDate(user?.subscriptionEnd)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={handleCreatePortalSession}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Payment Method
            </button>
            
            {!subscription?.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  cancelling ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
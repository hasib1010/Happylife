'use client';
// src/components/subscription/SubscriptionStatus.jsx
import { useSubscription } from '@/contexts/SubscriptionContext';
import Link from 'next/link';

export default function SubscriptionStatus() {
  const { 
    isLoading, 
    isActive, 
    isSubscribed, 
    subscriptionStatus, 
    subscription, 
    refreshSubscription 
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Not subscribed
  if (!isSubscribed) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Subscription Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You need an active subscription to access premium features.</p>
              <div className="mt-4">
                <Link
                  href="/subscription"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subscription exists but is not active
  if (isSubscribed && !isActive) {
    const status = subscriptionStatus || 'inactive';
    
    return (
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">Subscription Issue</h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>Your subscription status is: <span className="font-medium capitalize">{status}</span></p>
              <div className="mt-4">
                <Link
                  href="/subscription/manage"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200"
                >
                  Manage Subscription
                </Link>
                <button
                  onClick={refreshSubscription}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-orange-700 hover:bg-orange-100"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active subscription
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Subscription Active</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              Your subscription is active
              {subscription?.currentPeriodEnd && (
                <> until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
              )}
              .
            </p>
            <div className="mt-4">
              <Link
                href="/subscription/manage"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
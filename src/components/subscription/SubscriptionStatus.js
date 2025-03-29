'use client';
// src/components/subscription/SubscriptionStatus.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState(null);

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

    fetchSubscriptionStatus();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading subscription data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no subscription or not active
  if (!subscriptionData || !subscriptionData.isActive) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Your subscription is not active. 
              <Link href="/subscription" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                Subscribe now
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { subscription, user } = subscriptionData;
  const isPremiumUser = user?.role === 'provider' || user?.role === 'seller';
  const isProvider = user?.role === 'provider';
  const isSeller = user?.role === 'seller';

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isProvider ? 'Provider' : 'Seller'} Monthly Subscription
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-gray-500">Next billing date</span>
          <span className="block font-medium">{formatDate(user?.subscriptionEnd)}</span>
        </div>
        <div className="text-right">
          <Link
            href="/subscription/manage"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
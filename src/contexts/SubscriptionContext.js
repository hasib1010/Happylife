'use client';
// src/contexts/SubscriptionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch subscription data if user is logged in
    if (session?.user) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an active subscription using the same logic as the API
  const hasActiveSubscription = () => {
    if (!subscriptionData) return false;
    return subscriptionData.isActive === true;
  };

  // Refresh subscription data (useful after payment)
  const refreshSubscription = () => {
    setLoading(true);
    return fetchSubscriptionData();
  };

  const value = {
    subscriptionData,
    subscription: subscriptionData?.subscription,
    user: subscriptionData?.user,
    isActive: subscriptionData?.isActive,
    loading,
    error,
    hasActiveSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
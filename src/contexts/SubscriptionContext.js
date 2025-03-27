'use client';
// src/contexts/SubscriptionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = () => {
    if (!subscription) return false;
    
    // Check if the user has an active subscription status
    const isActive = ['active', 'trialing'].includes(subscription.status);
    
    // Check if the subscription is still valid (not expired)
    const isValid = subscription.currentPeriodEnd 
      ? new Date(subscription.currentPeriodEnd) > new Date() 
      : false;
      
    return isActive && isValid;
  };

  // Refresh subscription data (useful after payment)
  const refreshSubscription = () => {
    setLoading(true);
    return fetchSubscriptionData();
  };

  const value = {
    subscription,
    loading,
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
'use client';
// src/contexts/SubscriptionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Create context
const SubscriptionContext = createContext();

// Export the provider component
export function SubscriptionProvider({ children }) {
  const { data: session, update: updateSession } = useSession();
  const [subscriptionData, setSubscriptionData] = useState({
    isLoading: true,
    isActive: false,
    subscription: null,
    userData: null,
    error: null
  });

  // Fetch subscription data from API
  const fetchSubscriptionStatus = async () => {
    if (!session?.user?.id) return;
    
    try {
      setSubscriptionData(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (response.ok && data.success) {
        setSubscriptionData({
          isLoading: false,
          isActive: data.isActive,
          subscription: data.subscription,
          userData: data.user,
          error: null
        });
        
        // Update session if there's a mismatch with the database
        if (session?.user?.isSubscribed !== data.user.isSubscribed || 
            session?.user?.subscriptionStatus !== data.user.subscriptionStatus) {
          
          await updateSession({
            ...session,
            user: {
              ...session.user,
              isSubscribed: data.user.isSubscribed,
              subscriptionStatus: data.user.subscriptionStatus
            }
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'An error occurred while fetching subscription status'
      }));
    }
  };

  // Initial fetch when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptionStatus();
    } else {
      setSubscriptionData(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [session?.user?.id]);

  // Force refresh subscription status
  const refreshSubscription = () => {
    return fetchSubscriptionStatus();
  };

  // Values to provide in context
  const value = {
    ...subscriptionData,
    refreshSubscription,
    // Add some convenience properties
    isSubscribed: subscriptionData.userData?.isSubscribed || false,
    subscriptionStatus: subscriptionData.userData?.subscriptionStatus || null,
    subscriptionEnd: subscriptionData.userData?.subscriptionEnd || null,
    isPremiumUser: ['provider', 'seller'].includes(subscriptionData.userData?.role || '')
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Custom hook to use the subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
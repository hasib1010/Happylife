'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/providers/auth';

/**
 * A button component that allows users to refresh their subscription status
 * Useful when a user has just completed payment but the UI hasn't updated yet
 */
export default function SubscriptionRefreshButton({ user }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const { refreshUserData } = useAuth();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshMessage('');
    
    try {
      // Attempt to refresh user data including subscription status
      const result = await refreshUserData();
      
      if (result.success) {
        setRefreshMessage('Subscription status updated successfully!');
        // Reload the page after a short delay to show updated UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setRefreshMessage(result.message || 'Failed to refresh subscription status.');
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setRefreshMessage('An error occurred. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mt-4 text-center">
      <div className="text-sm text-gray-500 mb-2">
        Already subscribed but don't see your status updated?
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400"
      >
        <RefreshCw 
          className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        {isRefreshing ? 'Refreshing...' : 'Refresh subscription status'}
      </button>
      {refreshMessage && (
        <div className="mt-2 text-sm text-emerald-600">{refreshMessage}</div>
      )}
    </div>
  );
}
'use client';
// src/hooks/useRefreshSession.js
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

/**
 * Hook to refresh the session data at regular intervals
 * @param {number} interval - Interval in milliseconds (default: 30000ms or 30 seconds)
 * @returns {Object} Session data
 */
export function useRefreshSession(interval = 30000) {
  const { data: session, update } = useSession();
  const intervalIdRef = useRef(null);
  const refreshCountRef = useRef(0);

  useEffect(() => {
    // Function to refresh the session
    const refreshSession = async () => {
      try {
        refreshCountRef.current += 1;
        console.log(`Refreshing session... (count: ${refreshCountRef.current})`);
        await update();
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    };

    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    // Only set up interval if we have a session
    if (session && interval > 0) {
      // Initial refresh
      refreshSession();
      
      // Set up interval for periodic refresh
      intervalIdRef.current = setInterval(refreshSession, interval);
      
      // For debugging
      console.log(`Session refresh interval set: ${interval}ms`);
    }

    // Clean up interval on unmount or when dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('Session refresh interval cleared');
      }
    };
  }, [update, interval, session?.user?.id]); // Only recreate the interval if these change

  return { session };
}
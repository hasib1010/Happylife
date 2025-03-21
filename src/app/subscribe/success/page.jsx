'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth';
import { ROLES } from '@/lib/constants';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated, refreshUserData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  // Get the account type from URL parameters
  const accountType = searchParams.get('type') || ROLES.PROVIDER;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Simulate updating user account type
    const updateUserSubscription = async () => {
      setIsProcessing(true);
      try {
        // In a real application, this would be handled by the payment webhook
        // For this demo, we'll simulate updating the user's account type
        console.log('Updating user subscription status for:', accountType);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Refresh user data to get updated subscription status
        await refreshUserData();
        
        setIsProcessing(false);
      } catch (error) {
        console.error('Error updating subscription:', error);
        setIsProcessing(false);
      }
    };

    updateUserSubscription();
  }, [loading, isAuthenticated, router, accountType, refreshUserData]);

  if (loading || isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <h1 className="text-xl font-medium text-gray-900">Activating your subscription...</h1>
        <p className="mt-2 text-base text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Subscription Activated!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Thank you for subscribing to HappyLife.Services. Your 
          {accountType === ROLES.PROVIDER ? ' Service Provider' : ' Product Seller'} 
          account is now active.
        </p>
        <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-left">
          <h2 className="text-lg font-medium text-gray-900">What's next?</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>
                Complete your profile with all your details and expertise
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>
                {accountType === ROLES.PROVIDER 
                  ? 'Create your service listings with pricing and availability'
                  : 'Add your products with detailed descriptions and images'}
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>
                Write informative blog posts to showcase your expertise
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>
                Connect with clients and grow your wellness business
              </span>
            </li>
          </ul>
        </div>
        
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            You can manage your subscription at any time from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}
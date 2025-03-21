// src/app/subscribe/checkout/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, PenLine, ShoppingBag, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function CheckoutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiRetryCount, setApiRetryCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/subscribe/checkout');
    }
  }, [loading, isAuthenticated, router]);

  // Handle subscription checkout
  const handleSubscribe = async () => {
    if (!accountType) {
      setError('Please select an account type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountType }),
      });

      // Handle the response
      if (response.status === 401) {
        // Authentication issue
        if (apiRetryCount < 2) {
          // Try once more after a short delay (cookie might not be ready yet)
          setApiRetryCount(prev => prev + 1);
          setTimeout(() => {
            setIsLoading(false);
            handleSubscribe();
          }, 1000);
          return;
        } else {
          setError('Authentication error. Please try signing out and back in.');
          setIsLoading(false);
          return;
        }
      }

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.message || 'An error occurred during checkout');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to process subscription. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading state while auth is checking
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show a loading state while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900">Please sign in to continue</h2>
          <p className="mt-2 text-sm text-gray-500">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Account Type
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Select whether you want to list services as a provider or sell products. Your subscription gives you full access to all platform features.
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="mt-12 space-y-4">
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              accountType === 'provider' 
                ? 'border-emerald-600 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-300'
            }`}
            onClick={() => setAccountType('provider')}
          >
            <div className="flex items-start">
              <div className={`flex h-6 items-center ${accountType === 'provider' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <input
                  type="radio"
                  checked={accountType === 'provider'}
                  onChange={() => setAccountType('provider')}
                  className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <div className="flex items-center">
                  <PenLine className="h-5 w-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-gray-900">Service Provider</span>
                </div>
                <p className="mt-1 text-gray-600">
                  For coaches, therapists, healers, instructors, and wellness professionals who offer services to clients.
                </p>
                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                  <li>• Create a detailed provider profile</li>
                  <li>• List your services and prices</li>
                  <li>• Manage appointments and bookings</li>
                  <li>• Publish blogs about your expertise</li>
                </ul>
              </div>
            </div>
          </div>

          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              accountType === 'product_seller' 
                ? 'border-emerald-600 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-300'
            }`}
            onClick={() => setAccountType('product_seller')}
          >
            <div className="flex items-start">
              <div className={`flex h-6 items-center ${accountType === 'product_seller' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <input
                  type="radio"
                  checked={accountType === 'product_seller'}
                  onChange={() => setAccountType('product_seller')}
                  className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-gray-900">Product Seller</span>
                </div>
                <p className="mt-1 text-gray-600">
                  For businesses selling wellness products, supplements, tools, or other holistic health merchandise.
                </p>
                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                  <li>• List unlimited products with details</li>
                  <li>• Showcase ingredients and benefits</li>
                  <li>• Manage inventory and visibility</li>
                  <li>• Share product education through blogs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome message showing the user is signed in */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Signed in as <span className="font-medium">{user?.email}</span>
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription details */}
        <div className="mt-10 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Subscription Summary</h2>
            <div className="text-emerald-600 text-sm font-medium">$20.00/month</div>
          </div>
          <p className="mt-1 text-sm text-gray-500">Billed monthly. Cancel anytime.</p>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={!accountType || isLoading}
              className={`flex w-full items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${
                !accountType || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
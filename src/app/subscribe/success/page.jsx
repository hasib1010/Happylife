// src/app/subscribe/success/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Verify the payment session with our API
    const verifyPayment = async () => {
      if (!sessionId) {
        router.push('/subscribe');
        return;
      }

      try {
        const response = await fetch(`/api/subscriptions/verify?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setSession(data.session);
        } else {
          // If verification fails, redirect back to subscription page
          router.push('/subscribe');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <h2 className="text-lg font-medium text-gray-900">Verifying your subscription</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we confirm your payment...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-10 text-center sm:px-10">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Subscription Successful!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Thank you for subscribing to HappyLife.Services. Your account has been activated.
          </p>
          
          <div className="mt-8 text-left bg-white rounded-lg border border-emerald-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Subscription Details</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Plan:</span>
                <span className="text-sm font-medium text-gray-900">Premium Membership</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium text-gray-900">$20.00/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Next billing date:</span>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Clock className="mr-1 h-4 w-4 text-gray-400" /> 
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col space-y-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-emerald-600 px-5 py-3 text-center text-base font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center text-base font-semibold text-emerald-600 hover:text-emerald-500"
            >
              Complete Your Profile <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">What's Next?</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                1
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Complete Your Profile</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add your details, expertise, services, and upload photos to showcase your offerings.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                2
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Create Your First Listing</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add your products or services with detailed descriptions to attract potential clients.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                3
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">Publish Your First Blog</h3>
              <p className="mt-2 text-sm text-gray-500">
                Share your expertise and knowledge to establish yourself as an authority in your field.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, PenLine, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function SubscribePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Redirect to dashboard if user is already subscribed
  useEffect(() => {
    if (!loading && isAuthenticated && user?.subscriptionStatus === 'active') {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Join Our Wellness Community</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the right subscription that fits your wellness business needs. List your services, products, and share your expertise with our growing community.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Monthly Subscription</h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Get full access to our platform with a flexible monthly subscription. Choose between listing services as a provider or products as a seller.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-emerald-600">What's included</h4>
              <div className="h-px flex-auto bg-gray-100"></div>
            </div>
            <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Unlimited listings</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Featured in search results</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Blog publishing</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Analytics dashboard</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Custom profile page</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Pay monthly, cancel anytime</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">$20</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD / month</span>
                </p>
                
                {isAuthenticated ? (
                  <Link
                    href="/subscribe/checkout"
                    className="mt-10 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Choose your account type
                  </Link>
                ) : (
                  <Link
                    href="/auth/login?callbackUrl=/subscribe/checkout"
                    className="mt-10 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Sign in to subscribe
                  </Link>
                )}
                
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts available for easy company reimbursement
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Choose your path</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200">
              <div className="flex flex-1 flex-col justify-between bg-white p-6">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-emerald-100 p-3">
                      <PenLine className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="ml-3 text-xl font-semibold text-gray-900">Service Provider</h3>
                  </div>
                  <p className="mt-3 text-base text-gray-500">
                    Perfect for wellness practitioners, therapists, coaches, healers, and other service providers.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-gray-500">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Create detailed service listings with pricing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Manage availability calendar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Receive and manage booking requests</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Publish articles about your methods and practices</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link
                    href={isAuthenticated ? "/subscribe/checkout" : "/auth/login?callbackUrl=/subscribe/checkout"}
                    className="flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Subscribe as a Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200">
              <div className="flex flex-1 flex-col justify-between bg-white p-6">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-emerald-100 p-3">
                      <ShoppingBag className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="ml-3 text-xl font-semibold text-gray-900">Product Seller</h3>
                  </div>
                  <p className="mt-3 text-base text-gray-500">
                    Ideal for creators of wellness products, supplements, tools, or other holistic health merchandise.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-gray-500">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">List your wellness products with detailed descriptions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Upload multiple product images</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Manage inventory and product categories</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="ml-2">Publish articles about your products and their benefits</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link
                    href={isAuthenticated ? "/subscribe/checkout" : "/auth/login?callbackUrl=/subscribe/checkout"}
                    className="flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Subscribe as a Seller
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl bg-emerald-50 p-8 sm:p-10 lg:mx-0 lg:max-w-none">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">Is there a free trial?</h3>
              <p className="mt-2 text-sm text-gray-600">
                We don't offer a free trial, but our subscription is month-to-month with no long-term commitment. You can cancel anytime.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">Can I change my account type later?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Yes, you can switch between Provider and Seller account types at any time from your account settings.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">How does payment work?</h3>
              <p className="mt-2 text-sm text-gray-600">
                We process payments securely through Stripe. Your subscription will be automatically billed monthly.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7 text-gray-900">What happens if I cancel?</h3>
              <p className="mt-2 text-sm text-gray-600">
                You'll retain access until the end of your current billing period. After that, your listings will become inactive until you resubscribe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
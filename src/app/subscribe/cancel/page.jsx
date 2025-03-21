// src/app/subscribe/cancel/page.js
import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Subscription Cancelled - HappyLife.Services',
  description: 'Your subscription process was cancelled',
};

export default function SubscriptionCancelPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 px-6 py-10 text-center sm:px-10">
          <XCircle className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Subscription Cancelled</h1>
          <p className="mt-4 text-lg text-gray-600">
            Your subscription process was cancelled. No payment has been processed.
          </p>
          
          <div className="mt-10 flex flex-col space-y-4">
            <Link
              href="/subscribe"
              className="rounded-md bg-emerald-600 px-5 py-3 text-center text-base font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center text-base font-semibold text-gray-600 hover:text-gray-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
        
        <div className="mt-16">
          <div className="rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <HelpCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-900">Have questions?</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>We're here to help! If you encountered any issues or have questions about our subscription, please reach out to our support team.</p>
                  <div className="mt-4 flex flex-col space-y-2">
                    <div>
                      <span className="font-medium">Email:</span> support@happylife.services
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> (555) 123-4567
                    </div>
                    <div>
                      <span className="font-medium">Hours:</span> Monday-Friday, 9am-5pm EST
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Common questions:</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>What payment methods do you accept?</li>
                    <li>Can I upgrade or downgrade my subscription later?</li>
                    <li>Is there a minimum subscription period?</li>
                    <li>How can I get a refund if I'm not satisfied?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Why Join HappyLife.Services?</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-base font-medium text-gray-900">Expand Your Reach</h3>
              <p className="mt-2 text-sm text-gray-600">
                Connect with wellness enthusiasts actively seeking holistic health solutions and grow your client base.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-base font-medium text-gray-900">Showcase Your Expertise</h3>
              <p className="mt-2 text-sm text-gray-600">
                Create a professional online presence with detailed profiles, service listings, and educational content.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-base font-medium text-gray-900">Build Authority</h3>
              <p className="mt-2 text-sm text-gray-600">
                Publish blogs and articles to establish yourself as a thought leader in your wellness specialty.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-base font-medium text-gray-900">Streamlined Management</h3>
              <p className="mt-2 text-sm text-gray-600">
                Manage appointments, bookings, and client communications all in one place with our intuitive platform.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/subscribe"
              className="text-base font-medium text-emerald-600 hover:text-emerald-500"
            >
              View Subscription Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
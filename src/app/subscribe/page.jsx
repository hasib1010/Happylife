// src/app/subscribe/page.js
import Link from 'next/link';
import { CheckIcon } from 'lucide-react';

export const metadata = {
  title: 'Subscribe - HappyLife.Services',
  description: 'Join our wellness platform to list your services or products for only $20/month',
};

export default function SubscribePage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join the HappyLife.Services Community
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with wellness enthusiasts and grow your business with our simple and affordable subscription plan.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Wellness Provider Membership</h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Subscribe to HappyLife.Services and gain access to a community of wellness enthusiasts actively seeking holistic health solutions.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-emerald-600">What's included</h4>
              <div className="h-px flex-auto bg-gray-100"></div>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Personalized profile page</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Unlimited product/service listings</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Publish blogs and articles</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Enhanced visibility in search</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Booking and appointment management</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Client reviews and testimonials</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Photo gallery for your services</span>
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-5 flex-none text-emerald-600" />
                <span>Detailed analytics dashboard</span>
              </li>
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Monthly Subscription</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">$20</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD/month</span>
                </p>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Cancel anytime. No setup fees or hidden costs.
                </p>
                <Link
                  href="/auth/signin?callbackUrl=/subscribe/checkout"
                  className="mt-10 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="flex-1 rounded-2xl bg-gray-50 p-8">
                <h3 className="text-xl font-semibold text-gray-900">For Service Providers</h3>
                <p className="mt-4 text-base text-gray-600">
                  Perfect for therapists, nutritionists, coaches, healers, and wellness professionals who want to showcase their services and expertise.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>Detailed profile with your specialties and credentials</span>
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>Service listing with prices and descriptions</span>
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>Appointment scheduling system</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex-1 rounded-2xl bg-gray-50 p-8">
                <h3 className="text-xl font-semibold text-gray-900">For Product Sellers</h3>
                <p className="mt-4 text-base text-gray-600">
                  Ideal for wellness product creators, supplement brands, natural remedies, and holistic health products looking to reach a targeted audience.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>Showcase your products with detailed descriptions</span>
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>List ingredients, benefits, and usage instructions</span>
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon className="h-5 w-5 flex-none text-emerald-600" />
                    <span>Product image gallery and categorization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-gray-200 bg-white sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="p-8 sm:p-10">
            <h3 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h3>
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-base font-semibold text-gray-900">How does the subscription work?</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Once you subscribe, you'll be able to create a provider profile or list your products. Your subscription will renew monthly until canceled.
                </p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">Can I cancel my subscription?</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Yes, you can cancel your subscription at any time. Your profile will remain active until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">Do you offer any free trial?</h4>
                <p className="mt-2 text-sm text-gray-600">
                  We don't currently offer a free trial, but we do have a 14-day money-back guarantee if you're not satisfied with our platform.
                </p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">How do I get started?</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Click the "Subscribe Now" button, create an account, provide your payment information, and you'll be ready to set up your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
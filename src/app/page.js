// src/app/page.js
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Users, ShoppingBag, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-emerald-700">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to HappyLife.Services
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-emerald-100">
            Your comprehensive platform for holistic wellness products and trusted providers.
            Discover natural remedies, alternative therapies, and wellness experts all in one place.
          </p>
          <div className="mt-10 max-w-md w-full">
            <div className="relative rounded-md shadow-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                placeholder="Search for products, providers, or wellness topics..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  className="h-full px-4 text-white bg-emerald-500 hover:bg-emerald-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find everything you need for your wellness journey
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Discover natural remedies, wellness providers, and expert knowledge to support your holistic health.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Find Providers */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-md text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Find Trusted Providers</h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect with qualified practitioners, therapists, and wellness experts near you.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/providers" 
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-500"
                  >
                    Explore providers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Discover Products */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-md text-emerald-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Discover Natural Products</h3>
                <p className="mt-2 text-base text-gray-500">
                  Browse a wide selection of supplements, remedies, and wellness products from trusted sources.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/products" 
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-500"
                  >
                    Shop products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Read Expert Blogs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-md text-emerald-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Read Expert Content</h3>
                <p className="mt-2 text-base text-gray-500">
                  Gain knowledge from wellness experts through informative blogs and articles.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/blogs" 
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-500"
                  >
                    Read blogs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Popular Wellness Categories
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link 
                key={category.name}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75">
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-100 text-emerald-600">
                    {category.icon}
                  </div>
                </div>
                <h3 className="mt-2 text-sm text-gray-700">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription CTA */}
      <div className="bg-emerald-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to join the wellness community?</span>
            <span className="block text-emerald-300">Start listing your products or services today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-gray-100"
              >
                Subscribe Now - $20/month
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder for category icons
const categories = [
  { name: 'Mind & Body', slug: 'mind-body', icon: <span className="text-2xl">🧘</span> },
  { name: 'Nutrition', slug: 'nutrition', icon: <span className="text-2xl">🥗</span> },
  { name: 'Alternative Medicine', slug: 'alternative-medicine', icon: <span className="text-2xl">🌿</span> },
  { name: 'Fitness', slug: 'fitness', icon: <span className="text-2xl">💪</span> },
  { name: 'Mental Health', slug: 'mental-health', icon: <span className="text-2xl">🧠</span> },
  { name: 'Aromatherapy', slug: 'aromatherapy', icon: <span className="text-2xl">🌸</span> },
  { name: 'Spiritual Wellness', slug: 'spiritual-wellness', icon: <span className="text-2xl">✨</span> },
  { name: 'Sleep Health', slug: 'sleep-health', icon: <span className="text-2xl">😴</span> },
  { name: 'Chronic Pain', slug: 'chronic-pain', icon: <span className="text-2xl">🤕</span> },
  { name: 'Energy Healing', slug: 'energy-healing', icon: <span className="text-2xl">⚡</span> },
];
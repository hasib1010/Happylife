// src/components/NavigationMenu.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function NavigationMenu() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-emerald-600">
                HappyLife.Services
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/providers" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                Find Providers
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                Explore Products
              </Link>
              <Link href="/blogs" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                Read Blogs
              </Link>
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                  Categories <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute z-10 hidden group-hover:block pt-2 w-48">
                  <div className="bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-1">
                    <Link href="/categories/mind-body" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mind & Body
                    </Link>
                    <Link href="/categories/nutrition" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Nutrition
                    </Link>
                    <Link href="/categories/alternative-medicine" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Alternative Medicine
                    </Link>
                    <Link href="/categories/fitness" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Fitness & Movement
                    </Link>
                    <Link href="/categories/mental-health" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mental Health
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="hidden sm:block mr-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
                  </button>
                </div>
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Sign In
                </Link>
                <Link
                  href="/subscribe"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Subscribe ($20/mo)
                </Link>
              </div>
            )}
            
            <button
              type="button"
              className="ml-4 sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/providers"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Providers
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Products
            </Link>
            <Link
              href="/blogs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Read Blogs
            </Link>
            <div className="px-3 py-2">
              <div className="font-medium text-gray-800">Categories</div>
              <div className="mt-2 space-y-2 pl-4">
                <Link href="/categories/mind-body" className="block px-3 py-1 text-gray-700 hover:text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                  Mind & Body
                </Link>
                <Link href="/categories/nutrition" className="block px-3 py-1 text-gray-700 hover:text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                  Nutrition
                </Link>
                <Link href="/categories/alternative-medicine" className="block px-3 py-1 text-gray-700 hover:text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                  Alternative Medicine
                </Link>
                <Link href="/categories/fitness" className="block px-3 py-1 text-gray-700 hover:text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                  Fitness & Movement
                </Link>
                <Link href="/categories/mental-health" className="block px-3 py-1 text-gray-700 hover:text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                  Mental Health
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/subscribe"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Subscribe
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
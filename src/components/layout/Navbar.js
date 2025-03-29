'use client';
// src/components/layout/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation'; 
import { useAuth } from '../auth/AuthProvider';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { logout } = useAuth(); // Get logout from AuthProvider
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen || isProfileDropdownOpen) {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isProfileDropdownOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsMenuOpen(false);
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const result = await logout();
      if (result.success) {
        router.refresh(); // Refresh the page to update UI
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  const isPremiumUser = session?.user?.role === 'provider' || session?.user?.role === 'seller';
  const isAdmin = session?.user?.role === 'admin';
  
  // Determine the dashboard URL based on user role
  const dashboardUrl = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <nav
      className={`sticky top-0 z-50 w-full ${
        isScrolled || pathname !== '/' ? 'bg-white shadow-md' : 'bg-transparent'
      } transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-blue-600">HappyLife.Services</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link
              href="/services"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/services'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Services
            </Link>
            <Link
              href="/products"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/products'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Products
            </Link>
            <Link
              href="/blogs"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/blogs'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Blogs
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/about'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            {status === 'loading' ? (
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
            ) : session?.user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center max-w-xs rounded-full focus:outline-none"
                  >
                    <span className="mr-2 text-sm font-medium text-gray-700">
                      {session.user.name || 'User'}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>
                </div>

                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <Link
                      href={dashboardUrl}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                     
                    {isPremiumUser && (
                      <>
                        <Link
                          href={session.user.role === 'provider' ? '/dashboard/services' : '/dashboard/products'}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {session.user.role === 'provider' ? 'Manage Services' : 'Manage Products'}
                        </Link>
                        <Link
                          href="/subscription/manage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Subscription
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/services"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/services'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Services
            </Link>
            <Link
              href="/products"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/products'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Products
            </Link>
            <Link
              href="/blogs"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/blogs'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Blogs
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/about'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {status === 'loading' ? (
              <div className="animate-pulse h-8 mx-4 bg-gray-200 rounded"></div>
            ) : session?.user ? (
              <div>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {session.user.email || ''}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    href={dashboardUrl}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/dashboard/products"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Manage Products
                      </Link>
                      <Link
                        href="/admin/dashboard/services"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Manage Services
                      </Link>
                      <Link
                        href="/admin/dashboard/users"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Manage Users
                      </Link>
                    </>
                  )}
                  {isPremiumUser && (
                    <>
                      <Link
                        href={session.user.role === 'provider' ? '/dashboard/services' : '/dashboard/products'}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        {session.user.role === 'provider' ? 'Manage Services' : 'Manage Products'}
                      </Link>
                      <Link
                        href="/subscription/manage"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Subscription
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-2">
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 w-full text-center"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
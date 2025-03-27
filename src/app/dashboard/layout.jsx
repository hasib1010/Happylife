'use client';
// src/app/dashboard/layout.js
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSubscription } from '@/contexts/SubscriptionContext';
export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </ProtectedRoute>
    );
}

function DashboardLayoutContent({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isProvider = session?.user?.role === 'provider';
    const isSeller = session?.user?.role === 'seller';
    const isAdmin = session?.user?.role === 'admin';
    const isPremiumUser = isProvider || isSeller;

    // Close the sidebar when clicking outside on mobile
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (sidebarOpen && !event.target.closest('.sidebar')) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`sidebar bg-white shadow-md z-20 fixed inset-y-0 left-0 transition duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:static md:inset-0 md:w-64`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        HappyLife.Services
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-5 px-4 space-y-1">
                    <Link
                        href="/dashboard"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/dashboard'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                    >
                        <svg
                            className={`mr-3 h-5 w-5 ${pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Dashboard
                    </Link>

                    <Link
                        href="/profile"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/profile' || pathname.startsWith('/profile/')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                    >
                        <svg
                            className={`mr-3 h-5 w-5 ${pathname === '/profile' || pathname.startsWith('/profile/')
                                ? 'text-blue-500'
                                : 'text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        Profile
                    </Link>

                    <Link
                        href="/messages"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/messages' || pathname.startsWith('/messages/')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                    >
                        <svg
                            className={`mr-3 h-5 w-5 ${pathname === '/messages' || pathname.startsWith('/messages/')
                                ? 'text-blue-500'
                                : 'text-gray-500'
                                }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                        Messages
                    </Link>



                    {isProvider && (
                        <Link
                            href="/dashboard/services"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/dashboard/services' ||
                                    pathname.startsWith('/dashboard/services/') ||
                                    pathname === '/services/manage' ||
                                    pathname === '/services/create' ||
                                    pathname.startsWith('/services/edit')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <svg
                                className={`mr-3 h-5 w-5 ${pathname === '/dashboard/services' ||
                                        pathname.startsWith('/dashboard/services/') ||
                                        pathname === '/services/manage' ||
                                        pathname === '/services/create' ||
                                        pathname.startsWith('/services/edit')
                                        ? 'text-blue-500'
                                        : 'text-gray-500'
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            Services
                        </Link>
                    )}

                    {isSeller && (
                        <Link
                            href="/dashboard/products"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/dashboard/products' ||
                                    pathname.startsWith('/dashboard/products/') ||
                                    pathname === '/products/manage' ||
                                    pathname === '/products/create' ||
                                    pathname.startsWith('/products/edit')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <svg
                                className={`mr-3 h-5 w-5 ${pathname === '/dashboard/products' ||
                                        pathname.startsWith('/dashboard/products/') ||
                                        pathname === '/products/manage' ||
                                        pathname === '/products/create' ||
                                        pathname.startsWith('/products/edit')
                                        ? 'text-blue-500'
                                        : 'text-gray-500'
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            Products
                        </Link>
                    )}

                    {isPremiumUser && (
                        <Link
                            href="/subscription"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/subscription' || pathname.startsWith('/subscription/')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <svg
                                className={`mr-3 h-5 w-5 ${pathname === '/subscription' || pathname.startsWith('/subscription/')
                                    ? 'text-blue-500'
                                    : 'text-gray-500'
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                            Subscription
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === '/admin' || pathname.startsWith('/admin/')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <svg
                                className={`mr-3 h-5 w-5 ${pathname === '/admin' || pathname.startsWith('/admin/')
                                    ? 'text-blue-500'
                                    : 'text-gray-500'
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Admin
                        </Link>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white shadow-sm z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="text-lg font-semibold text-gray-900 ml-2 md:ml-0">
                            {pathname === '/dashboard' && 'Dashboard'}
                            {pathname === '/profile' && 'Profile'}
                            {pathname === '/profile/edit' && 'Edit Profile'}
                            {pathname === '/messages' && 'Messages'}
                            {pathname === '/services/manage' && 'Manage Services'}
                            {pathname === '/products/manage' && 'Manage Products'}
                            {pathname === '/subscription' && 'Subscription'}
                            {pathname === '/admin' && 'Admin Dashboard'}
                        </div>

                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline-block">
                                {session?.user?.name}
                            </span>
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
            </div>
        </div>
    );
}
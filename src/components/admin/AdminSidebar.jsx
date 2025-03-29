'use client';
// src/components/admin/AdminSidebar.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await logout();
      if (result.success) {
        router.push('/');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-800 text-white transition-all duration-300 ease-in-out h-screen relative`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          <li>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              {!isCollapsed && <span className="ml-3">Overview</span>}
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Users</span>}
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              {!isCollapsed && <span className="ml-3">Products</span>}
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'services' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Services</span>}
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'blogs' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Blogs</span>}
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === 'subscriptions' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Subscriptions</span>}
            </button>
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full p-3 rounded-md hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
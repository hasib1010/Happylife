// Component Path: src/components/admin/AdminOverview.js
// Used in admin dashboard to display overview statistics

'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import Link from 'next/link';

export default function AdminOverview({ stats }) {
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent users
        const usersResponse = await fetchWithAuth('/api/admin/users/recent');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setRecentUsers(usersData.users || []);
        }
        
        // Fetch recent subscriptions
        const subsResponse = await fetchWithAuth('/api/admin/subscriptions/recent');
        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          setRecentSubscriptions(subsData.subscriptions || []);
        }
      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="text-xl font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Active Subscriptions</dt>
                  <dd className="text-xl font-semibold text-gray-900">{stats?.activeSubscriptions || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Services */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Services</dt>
                  <dd className="text-xl font-semibold text-gray-900">{stats?.totalServices || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Products</dt>
                  <dd className="text-xl font-semibold text-gray-900">{stats?.totalProducts || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth and Revenue Charts would go here */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Monthly User Growth</h3>
          <p className="text-gray-500">Chart component would be rendered here</p>
          <div className="mt-4 h-64 w-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">User Growth Chart</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Monthly Revenue</h3>
          <p className="text-gray-500">Chart component would be rendered here</p>
          <div className="mt-4 h-64 w-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">Revenue Chart</p>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recently Joined Users */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Recently Joined Users</h3>
          </div>
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              </div>
            ) : recentUsers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <li key={user._id} className="py-4">
                    <div className="flex items-center">
                      <div className="mr-4 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="truncate text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                        <p className="mt-1 text-xs font-medium text-indigo-600">{user.role}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-gray-500">No recent users found</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/users"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => document.getElementById('usersTab')?.click()}
              >
                View all users
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Subscriptions */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Subscriptions</h3>
          </div>
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              </div>
            ) : recentSubscriptions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentSubscriptions.map((sub) => (
                  <li key={sub._id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{sub.userName || 'Unknown User'}</p>
                          <p className="truncate text-sm text-gray-500">{sub.userEmail || 'No email'}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            sub.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : sub.status === 'trialing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(sub.createdAt)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-gray-500">No recent subscriptions found</p>
            )}
            <div className="mt-4">
              <Link
                href="/admin/subscriptions"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => document.getElementById('subscriptionsTab')?.click()}
              >
                View all subscriptions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
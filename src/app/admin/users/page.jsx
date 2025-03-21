// src/app/admin/users/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = users;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply account type filter
    if (accountTypeFilter !== 'all') {
      result = result.filter(user => user.accountType === accountTypeFilter);
    }
    
    // Apply subscription filter
    if (subscriptionFilter !== 'all') {
      result = result.filter(user => user.subscriptionStatus === subscriptionFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, accountTypeFilter, subscriptionFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch actual data
      // For demo, use mock data
      const mockUsers = [
        { id: '1', name: 'Jane Smith', email: 'jane@example.com', accountType: 'provider', subscriptionStatus: 'active', createdAt: '2025-03-15T10:23:01Z' },
        { id: '2', name: 'John Doe', email: 'john@example.com', accountType: 'product_seller', subscriptionStatus: 'active', createdAt: '2025-03-14T14:56:33Z' },
        { id: '3', name: 'Alice Johnson', email: 'alice@example.com', accountType: 'regular', subscriptionStatus: 'none', createdAt: '2025-03-13T09:12:45Z' },
        { id: '4', name: 'Robert Williams', email: 'robert@example.com', accountType: 'provider', subscriptionStatus: 'past_due', createdAt: '2025-03-12T16:39:27Z' },
        { id: '5', name: 'Emma Davis', email: 'emma@example.com', accountType: 'product_seller', subscriptionStatus: 'canceled', createdAt: '2025-03-11T11:05:18Z' },
        { id: '6', name: 'Michael Brown', email: 'michael@example.com', accountType: 'admin', subscriptionStatus: 'none', createdAt: '2025-03-10T08:33:52Z' },
        { id: '7', name: 'Sarah Wilson', email: 'sarah@example.com', accountType: 'provider', subscriptionStatus: 'active', createdAt: '2025-03-09T13:47:19Z' },
        { id: '8', name: 'David Miller', email: 'david@example.com', accountType: 'regular', subscriptionStatus: 'none', createdAt: '2025-03-08T15:21:33Z' },
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-80"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                {/* Account Type Filter */}
                <div>
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Account Types</option>
                    <option value="admin">Admin</option>
                    <option value="provider">Provider</option>
                    <option value="product_seller">Product Seller</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
                
                {/* Subscription Filter */}
                <div>
                  <select
                    value={subscriptionFilter}
                    onChange={(e) => setSubscriptionFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Subscription Status</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                    <option value="none">No Subscription</option>
                  </select>
                </div>
                
                {/* Add User Button */}
                <Link
                  href="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add User
                </Link>
              </div>
            </div>
          </div>
          
          {/* User Table */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.accountType === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.accountType === 'provider' ? 'bg-blue-100 text-blue-800' :
                              user.accountType === 'product_seller' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.accountType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                              user.subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                              user.subscriptionStatus === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscriptionStatus === 'none' ? 'No subscription' : user.subscriptionStatus}
                            </span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/admin/users/${user.id}`} className="text-emerald-600 hover:text-emerald-900 mr-3">
                              Edit
                            </Link>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No users found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> users
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        disabled
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-300 cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        aria-current="page"
                        className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        1
                      </button>
                      <button
                        disabled
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-300 cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// src/app/admin/users/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash, AlertTriangle } from 'lucide-react';

export default function AdminUserEditPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountType: 'regular',
    subscriptionStatus: 'none'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId) => {
    setLoading(true);
    try {
      // In a real application, you would fetch actual data
      // For demo, use mock data
      const mockUser = {
        id: userId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        accountType: 'provider',
        subscriptionStatus: 'active',
        createdAt: '2025-03-15T10:23:01Z'
      };
      
      setUser(mockUser);
      setFormData({
        name: mockUser.name,
        email: mockUser.email,
        accountType: mockUser.accountType,
        subscriptionStatus: mockUser.subscriptionStatus
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real application, you would send the data to your API
      // For demo, simulate a save
      console.log('Saving user:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('User updated successfully');
      
      // Update local user data
      setUser({
        ...user,
        ...formData
      });
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real application, you would send a delete request to your API
      // For demo, simulate a delete
      console.log('Deleting user:', id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
        <p className="mt-2 text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
            <p className="mt-2 text-gray-600">The user you are looking for does not exist or has been removed.</p>
            <Link href="/admin/users" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center mb-6">
          <Link href="/admin/users" className="mr-4 text-emerald-600 hover:text-emerald-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              User ID: {id}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="provider">Provider</option>
                    <option value="product_seller">Product Seller</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700">
                    Subscription Status
                  </label>
                  <select
                    id="subscriptionStatus"
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                    <option value="none">No Subscription</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700">User Details</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Created: {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete User
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
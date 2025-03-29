// Component Path: src/components/admin/AdminSubscriptions.js
// Used in admin dashboard to manage subscriptions

'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchSubscriptions = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      });

      const response = await fetchWithAuth(`/api/admin/subscriptions?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message);
      toast.error(`Error loading subscriptions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchSubscriptions(1, searchTerm, statusFilter);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This will take effect at the end of the current billing period.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      
      // Refresh the subscriptions list
      fetchSubscriptions(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error(`Error cancelling subscription: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'unpaid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Subscription Detail Modal
  const SubscriptionDetailModal = ({ isOpen, onClose, subscription }) => {
    if (!isOpen || !subscription) return null;

    return (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Details</h3>
                  <div className="mt-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">User</p>
                        <p className="mt-1 text-sm text-gray-900">{subscription.userName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{subscription.userEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Subscription ID</p>
                      <p className="mt-1 text-sm text-gray-900">{subscription.stripeSubscriptionId}</p>
                    </div>
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Period Start</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.currentPeriodStart)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Period End</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.currentPeriodEnd)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Price ID</p>
                      <p className="mt-1 text-sm text-gray-900">{subscription.stripePriceId}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Auto Renew</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {subscription.cancelAtPeriodEnd ? 'No (Will cancel at period end)' : 'Yes'}
                      </p>
                    </div>
                    {subscription.canceledAt && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Canceled At</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.canceledAt)}</p>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Created At</p>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleCancelSubscription(subscription._id);
                  }}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel Subscription
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow">
      {/* Search and Filter */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Subscription Management</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subscriptions..."
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-x-auto">
        {loading && subscriptions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading subscriptions...</span>
          </div>
        ) : error && subscriptions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="mb-4 text-red-500">{error}</p>
            <button
              onClick={() => fetchSubscriptions(currentPage, searchTerm, statusFilter)}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  End Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Auto Renew
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <tr key={subscription._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{subscription.userName || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{subscription.userEmail || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(subscription.status)}`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(subscription.currentPeriodStart)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {subscription.cancelAtPeriodEnd ? 'No' : 'Yes'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(subscription)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                        <button
                          onClick={() => handleCancelSubscription(subscription._id)}
                          className="ml-4 text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {subscriptions.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, (totalPages * 10))}</span> of{' '}
              <span className="font-medium">{totalPages * 10}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <SubscriptionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        subscription={selectedSubscription}
      />
    </div>
  );
}
// Component Path: src/components/admin/AdminServices.js
// Used in admin dashboard to manage services

'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchServices = async (page = 1, search = '', status = 'all', category = 'all') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(category !== 'all' && { category }),
      });

      const response = await fetchWithAuth(`/api/admin/services?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
      toast.error(`Error loading services: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(currentPage, searchTerm, statusFilter, categoryFilter);
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchServices(1, searchTerm, statusFilter, categoryFilter);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const handleToggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      const response = await fetchWithAuth(`/api/admin/services/${serviceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'} service`);
      }

      toast.success(`Service ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      
      // Refresh the services list
      fetchServices(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error updating service status:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      toast.success('Service deleted successfully');
      
      // Refresh the services list
      fetchServices(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error(`Error deleting service: ${err.message}`);
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

  // Service Detail Modal
  const ServiceDetailModal = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;

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
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Service Details</h3>
                  <div className="mt-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Business Name</p>
                      <p className="mt-1 text-sm text-gray-900">{service.businessName}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Provider</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {service.provider?.name || 'Unknown Provider'}
                      </p>
                      <p className="text-sm text-gray-500">{service.provider?.email || 'No email'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="mt-1 text-sm text-gray-900">{service.category}</p>
                      {service.subcategory && (
                        <p className="text-sm text-gray-500">Subcategory: {service.subcategory}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-900">{service.description}</p>
                    </div>
                    
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              service.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : service.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {service.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active</p>
                        <p className="mt-1 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              service.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {service.isActive ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Features</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-gray-900">
                          {service.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">View Count</p>
                        <p className="mt-1 text-sm text-gray-900">{service.viewCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(service.createdAt)}</p>
                      </div>
                    </div>
                    
                    {service.location && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {service.location.isRemote
                            ? 'Remote Service'
                            : service.location.address?.city
                            ? `${service.location.address.city}, ${service.location.address.state}`
                            : 'No address specified'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => handleToggleServiceStatus(service._id, service.status)}
                className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  service.status === 'published'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {service.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleDeleteService(service._id);
                }}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
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
          <h2 className="text-xl font-semibold text-gray-900">Services Management</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Holistic Medicine">Holistic Medicine</option>
                <option value="Nutrition & Supplements">Nutrition & Supplements</option>
                <option value="Mental Health & Therapy">Mental Health & Therapy</option>
                <option value="Alternative Medicine">Alternative Medicine</option>
                <option value="Physical Wellness">Physical Wellness</option>
                <option value="Energy Healing">Energy Healing</option>
                <option value="Mind-Body Practices">Mind-Body Practices</option>
              </select>
            </div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
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

      {/* Services Table */}
      <div className="overflow-x-auto">
        {loading && services.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading services...</span>
          </div>
        ) : error && services.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="mb-4 text-red-500">{error}</p>
            <button
              onClick={() => fetchServices(currentPage, searchTerm, statusFilter, categoryFilter)}
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
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Provider
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {service.logo ? (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={service.logo} alt="" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">{service.businessName?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.businessName}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{service.provider?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{service.provider?.email || 'No email'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {service.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : service.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(service.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(service)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleServiceStatus(service._id, service.status)}
                        className={`ml-4 ${
                          service.status === 'published' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {service.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {services.length > 0 && (
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
      <ServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
}
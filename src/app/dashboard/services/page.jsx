'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FeatureServiceButton from '@/components/FeatureServiceButton';

export default function DashboardDirectoryPage() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']}>
      <DirectoryManagement />
    </ProtectedRoute>
  );
}

function DirectoryManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const { isActive } = useSubscription();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL parameter cleanup
  useEffect(() => {
    const handleURLParams = () => {
      const hasFeatureSuccess = searchParams.get('feature_success') === 'true';
      const hasFeatureCanceled = searchParams.get('feature_canceled') === 'true';
      
      if (hasFeatureSuccess || hasFeatureCanceled) {
        // Display toast message based on parameter
        if (hasFeatureSuccess) {
          toast.success('Payment successful! Your business will be featured shortly.');
        } else if (hasFeatureCanceled) {
          toast.error('Feature upgrade canceled.');
        }
        
        // Clean URL parameters without page reload
        const params = new URLSearchParams(searchParams.toString());
        params.delete('feature_success');
        params.delete('feature_canceled');
        params.delete('session_id');
        
        const newPath = `/dashboard/services${params.toString() ? `?${params.toString()}` : ''}`;
        router.replace(newPath, { scroll: false });
      }
    };

    handleURLParams();
  }, [searchParams, router]);

  // Fetch listings - optimized with useCallback to prevent unnecessary re-renders
  const fetchListings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching directory listings for user ID:", session.user.id);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/services?providerId=${session.user.id}&_=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch directory listings');
      }

      const data = await response.json();
      
      // Handle different API response formats
      let servicesList = [];
      if (data.services) {
        servicesList = data.services;
      } else if (data.listings) {
        servicesList = data.listings;
      } else {
        servicesList = [];
      }

      // Transform services to directory listings format
      const transformedListings = servicesList.map(service => ({
        id: service._id || service.id,
        businessName: service.businessName || service.title,
        description: service.description,
        category: service.category,
        subcategory: service.subcategory,
        logo: service.logo || (service.images && service.images.length > 0 ? service.images[0] : null),
        coverImage: service.coverImage,
        contact: service.contact || {
          email: service.provider?.email || '',
          phone: '',
          alternatePhone: ''
        },
        website: service.website || '',
        socialMedia: service.socialMedia || {},
        location: service.location,
        status: service.status,
        isFeatured: service.isFeatured,
        featureExpiration: service.featureExpiration,
        subscriptionStatus: service.subscriptionStatus || 'active',
        viewCount: service.viewCount || 0,
        clickCount: service.clickCount || 0,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        provider: service.provider,
        _id: service._id || service.id  // Keep _id for compatibility with components
      }));

      setListings(transformedListings);
    } catch (error) {
      console.error('Error fetching directory listings:', error);
      setError(error.message || 'An error occurred while fetching directory listings');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Load listings when session is ready
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      fetchListings();
    } else if (sessionStatus === "unauthenticated") {
      setError("You must be logged in to view your directory listings");
      setIsLoading(false);
    }
  }, [session?.user?.id, sessionStatus, refreshCounter, fetchListings]);

  // Manual refresh function - simplified
  const refreshListings = () => {
    setRefreshCounter(prev => prev + 1);
  };

 // Updated handleStatusChange function to use the simplified API

const handleStatusChange = async (listingId, newStatus) => {
  try {
    console.log("========== STATUS UPDATE ==========");
    console.log(`Attempting to update listing status: ID=${listingId}, status=${newStatus}`);
    
    // Validate inputs
    if (!listingId) {
      console.error("Missing listing ID");
      throw new Error('Listing ID is missing');
    }

    // Find the listing in our state
    const listing = listings.find(l => l.id === listingId);
    
    if (!listing) {
      console.error(`Listing not found with ID: ${listingId}`);
      throw new Error('Listing not found in current state');
    }

    // Log all IDs for debugging
    console.log("Listing details:", {
      id: listing.id,
      _id: listing._id,
      displayName: listing.businessName || listing.title
    });

    // Validate status
    const validStatuses = ['draft', 'published', 'suspended'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Use either _id or id, preferring _id for MongoDB compatibility
    const idToUse = listing._id || listing.id;
    
    if (!idToUse) {
      throw new Error('Could not determine a valid ID for this listing');
    }

    console.log(`Using ID for API call: ${idToUse}`);

    const requestBody = { 
      id: idToUse, 
      status: newStatus 
    };
    console.log('Request payload:', JSON.stringify(requestBody));

    // Call the simplified API endpoint
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("API response status:", response.status);
    
    // Get response data as text first (for debugging)
    const responseText = await response.text();
    console.log("API response text:", responseText);
    
    // Parse the JSON (if it's valid)
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("API response data:", data);
    } catch (e) {
      console.error("Error parsing response JSON:", e);
      throw new Error(`Invalid response from server: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Failed to update listing status (${response.status})`);
    }

    // Update the listing in the local state
    setListings(prevListings => 
      prevListings.map(item =>
        item.id === listingId ? { ...item, status: newStatus } : item
      )
    );

    toast.success('Listing status updated successfully');
    console.log("Status update successful");
  } catch (error) {
    console.error('Error updating listing status:', error);
    toast.error(error.message || 'An error occurred while updating listing status');
  }
};

  // Enhanced delete handler
const handleDelete = async (listingId) => {
  if (!confirm('Are you sure you want to delete this directory listing? This action cannot be undone.')) {
    return;
  }

  try {
    // Find the MongoDB _id
    const listing = listings.find(l => l.id === listingId);
    if (!listing) {
      throw new Error('Listing not found in current state');
    }

    const mongoId = listing._id || listing.id;
    console.log(`Attempting to delete listing: ${mongoId}`);
    
    // Add request debugging
    const response = await fetch(`/api/services/${mongoId}`, {
      method: 'DELETE',
    });

    // Log the raw response for debugging
    const responseText = await response.text();
    console.log("Delete API response:", responseText);
    
    let data;
    try {
      // Try to parse as JSON
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Response is not valid JSON:", e);
      throw new Error(`Server returned invalid response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Failed to delete (Status: ${response.status})`);
    }

    // Update local state
    setListings(listings.filter(listing => listing.id !== listingId));
    toast.success('Directory listing deleted successfully');
  } catch (error) {
    console.error('Error deleting directory listing:', error);
    toast.error(error.message || 'An error occurred while deleting the directory listing');
  }
}

  // Featured status check - more efficient implementation
  const isListingFeatured = (listing) => {
    if (!listing) return false;
    
    // Check both conditions together
    return Boolean(listing.isFeatured) && 
           Boolean(listing.featureExpiration) && 
           new Date(listing.featureExpiration) > new Date();
  };

  // Refresh button component - kept simple
  const RefreshButton = () => (
    <button
      onClick={refreshListings}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
    >
      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  );

  return (
    <div className="py-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Directory Listings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your business listings in our directory.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <RefreshButton />
            {isActive ? (
              <Link
                href="/dashboard/services/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Business
              </Link>
            ) : (
              <Link
                href="/subscription"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Subscribe to Add Listings
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No directory listings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isActive ?
                  "Get started by adding your business to our directory." :
                  "You need an active subscription to create directory listings."}
              </p>
              {isActive && (
                <div className="mt-6">
                  <Link
                    href="/dashboard/services/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add New Business
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <li key={listing.id} className={isListingFeatured(listing) ? 'bg-yellow-50' : ''}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {listing.logo ? (
                              <img
                                src={listing.logo}
                                alt={listing.businessName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600 truncate flex items-center">
                              {listing.businessName}
                              {isListingFeatured(listing) && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-4 w-4 ml-1 text-yellow-500"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                            </p>
                            {isListingFeatured(listing) && listing.featureExpiration && (
                              <p className="text-xs text-yellow-600">
                                Featured until {new Date(listing.featureExpiration).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : listing.status === 'pending'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {listing.category}
                          </p>
                          {listing.contact && listing.contact.email && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {listing.contact.email}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{listing.viewCount || 0} views</span>
                          {listing.clickCount > 0 && (
                            <span className="ml-2">• {listing.clickCount} clicks</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        {listing.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'published')}
                            type="button"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            Publish
                          </button>
                        )}
                        {listing.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'draft')}
                            type="button"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                          >
                            Unpublish
                          </button>
                        )}

                        {/* Feature Service Button - note we're using the _id for the FeatureServiceButton */}
                        <FeatureServiceButton
                          service={{ ...listing, _id: listing._id }}
                          key={`feature-${listing._id}`}
                        />

                        <Link
                          href={`/dashboard/services/edit/${listing.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          type="button"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
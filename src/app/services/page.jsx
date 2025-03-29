'use client';
// src/app/services/page.jsx
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Content component that uses searchParams
function DirectoryPageContent() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredCount, setFeaturedCount] = useState(0);
  
  const searchParams = useSearchParams();
  
  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);
  
  // Fetch directory listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        
        // Build query params
        const queryParams = new URLSearchParams();
        if (selectedCategory) {
          queryParams.append('category', selectedCategory);
        }
        queryParams.append('status', 'published');
        
        // Use the public API endpoint for services
        const response = await fetch(`/api/public/services?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch directory listings');
        }
        
        const data = await response.json();
        console.log('Fetched directory listings:', data);
        
        setListings(data.services || []);
        
        // Extract unique categories for filter
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else if (data.services && data.services.length > 0) {
          // Fallback to extracting from services if categories not provided separately
          const uniqueCategories = [...new Set(data.services.map(service => service.category))];
          setCategories(uniqueCategories);
        }

        // Calculate featured count if provided or from services
        if (data.filters && data.filters.featuredCount !== undefined) {
          setFeaturedCount(data.filters.featuredCount);
        } else {
          // Count featured listings manually
          const featuredServices = data.services ? 
            data.services.filter(service => 
              service.isFeatured && 
              service.featureExpiration && 
              new Date(service.featureExpiration) > new Date()
            ) : [];
          setFeaturedCount(featuredServices.length);
        }
      } catch (error) {
        console.error('Error fetching directory listings:', error);
        setError(error.message || 'An error occurred while fetching directory listings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [selectedCategory]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Check if a service is featured with a valid expiration date
  const isServiceFeatured = (service) => {
    return service.isFeatured && 
           service.featureExpiration && 
           new Date(service.featureExpiration) > new Date();
  };
  
  // Get featured and non-featured services
  const featuredServices = listings.filter(isServiceFeatured);
  const regularServices = listings.filter(service => !isServiceFeatured(service));
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Business Directory
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find the perfect business for your needs
          </p>
        </div>
        
        {/* Category filters */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
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
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No businesses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory ? `No businesses found in the "${selectedCategory}" category.` : 'No businesses available at the moment.'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Listings Section */}
            {featuredServices.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-500 mr-2">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h2 className="text-xl font-bold">Featured Businesses</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredServices.map(listing => (
                    <ListingCard key={`featured-${listing.id || listing._id}`} listing={listing} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Listings Section */}
            {regularServices.length > 0 && (
              <>
                {/* Add a heading to separate regular listings if there are featured ones */}
                {featuredServices.length > 0 && (
                  <div className="mb-4 mt-8">
                    <h2 className="text-xl font-bold">All Businesses</h2>
                    <div className="h-0.5 bg-gray-200 mt-2"></div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {regularServices.map(listing => (
                    <ListingCard key={listing.id || listing._id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function DirectoryLoading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Business Directory
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find the perfect business for your needs
          </p>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}

// Listing Card Component
function ListingCard({ listing }) {
  // Check if listing is featured with a valid expiration date
  const isFeatured = listing.isFeatured && 
                    listing.featureExpiration && 
                    new Date(listing.featureExpiration) > new Date();
  
  // Get the business name (use title as fallback for backwards compatibility)
  const businessName = listing.businessName || listing.title;
  
  // Get the logo or first image (for backwards compatibility)
  const logoImage = listing.logo || 
                   (listing.images && listing.images.length > 0 ? listing.images[0] : null);
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
      isFeatured ? 'ring-2 ring-yellow-400 bg-gradient-to-b from-yellow-50 to-white' : ''
    }`}>
      <div className="relative">
        {/* Business image */}
        <div className="h-48 w-full bg-gray-200">
          {logoImage ? (
            <img
              src={logoImage}
              alt={businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 mr-1">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          {listing.category}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-3">
          {/* Provider image */}
          <div className="flex-shrink-0 mr-2">
            {listing.provider && listing.provider.profilePicture ? (
              <img 
                src={listing.provider.profilePicture} 
                alt={listing.provider.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
            )}
          </div>
          
          {/* Provider name */}
          <div className="text-sm text-gray-600">
            {listing.provider ? (
              listing.provider.businessName || listing.provider.name
            ) : 'Business Owner'}
          </div>
          
          {/* View count */}
          <div className="ml-auto flex items-center">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm text-gray-600 ml-1">
              {listing.viewCount ? Math.floor(listing.viewCount) : 0}
            </span>
          </div>
        </div>
        
        {/* Business name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link href={`/services/${listing.id || listing._id}`} className="hover:text-blue-600">
            {businessName}
          </Link>
        </h3>
        
        {/* Description preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>
        
        {/* Contact info and view details */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-sm text-gray-600">
            {listing.contact && listing.contact.email ? (
              <div className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate max-w-[120px]">Contact</span>
              </div>
            ) : 'View details'}
          </div>
          
          <Link
            href={`/services/${listing.id || listing._id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function DirectoryPage() {
  return (
    <Suspense fallback={<DirectoryLoading />}>
      <DirectoryPageContent />
    </Suspense>
  );
}
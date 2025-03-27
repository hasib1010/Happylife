'use client';
// src/app/services/[id]/page.jsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast, Toaster } from 'react-hot-toast';

export default function DirectoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [clickedContact, setClickedContact] = useState(false);

  // Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/public/services/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Business listing not found');
          }
          throw new Error('Failed to fetch business details');
        }

        const data = await response.json();
        setListing(data.service);
        setRelatedListings(data.relatedServices || []);
      } catch (error) {
        console.error('Error fetching business details:', error);
        setError(error.message || 'An error occurred while fetching business details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListingDetails();
    }
  }, [id]);

  const handleImageChange = (index) => {
    setActiveImage(index);
  };

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  // Track click on contact info
  const handleContactClick = async (type) => {
    setClickedContact(true);
    if (!clickedContact && listing) {
      try {
        await fetch(`/api/public/services/${id}/track-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clickType: type }),
        });
        console.log(`Tracked ${type} click`);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  // Check if listing is featured with valid expiration
  const isFeatured = listing?.isFeatured &&
    listing?.featureExpiration &&
    new Date(listing.featureExpiration) > new Date();

  // Helper function to get image sources
  const getImageSources = () => {
    if (!listing) return [];

    const sources = [];
    if (listing.logo) sources.push(listing.logo);
    if (listing.coverImage && listing.coverImage !== listing.logo) sources.push(listing.coverImage);

    if (listing.images && listing.images.length > 0) {
      listing.images.forEach(img => {
        if (!sources.includes(img)) sources.push(img);
      });
    }

    return sources;
  };

  // Get business hours for a specific day
  const getHoursForDay = (dayNum) => {
    if (!listing?.businessHours) return null;
    const dayHours = listing.businessHours.find(hours => hours.day === dayNum);
    if (!dayHours) return null;
    return dayHours.isClosed ? 'Closed' : `${dayHours.open} - ${dayHours.close}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Business listing not found'}</p>
              <div className="mt-4">
                <Link href="/services" className="text-sm text-blue-600 hover:text-blue-500">
                  ← Back to directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageSources = getImageSources();
  const businessName = listing.businessName || listing.title;

  return (
    <div className="bg-white">
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex text-sm text-gray-500">
          <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
          <li className="mx-2">/</li>
          <li><Link href="/services" className="hover:text-gray-700">Directory</Link></li>
          <li className="mx-2">/</li>
          <li className="text-gray-700 font-medium">{businessName}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Left column - Image gallery */}
          <div className="flex flex-col">
            {/* Featured badge */}
            {isFeatured && (
              <div className="z-10 mb-4 inline-flex self-start items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                <svg className="h-4 w-4 mr-1 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured Business
              </div>
            )}

            {/* Main image */}
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 mb-4">
              {imageSources.length > 0 ? (
                <img
                  src={imageSources[activeImage]}
                  alt={businessName}
                  className="w-full h-full object-center object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Image thumbnails */}
            {imageSources.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {imageSources.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageChange(idx)}
                    className={`aspect-w-1 aspect-h-1 rounded overflow-hidden ${activeImage === idx ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${businessName} - image ${idx + 1}`}
                      className="w-full h-full object-center object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Business hours */}
            {listing.businessHours && listing.businessHours.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
                <div className="mt-4 space-y-1">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                    const hours = getHoursForDay(index);
                    if (!hours) return null;
                    return (
                      <div key={day} className="flex justify-between">
                        <span className="text-sm text-gray-500">{day}</span>
                        <span className="text-sm font-medium text-gray-900">{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business owner info - updated to be clickable */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Business Owner</h3>
              <div className="mt-4">
                {listing.provider ? (
                  <Link href={`/profile/public/${listing.provider.id}`} className="group">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {listing.provider.profilePicture ? (
                          <img
                            src={listing.provider.profilePicture}
                            alt={listing.provider.name}
                            className="h-12 w-12 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <span className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-md font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {listing.provider.businessName || listing.provider.name}
                          <span className="ml-1 inline-block text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </h4>
                        <p className="text-sm text-gray-500">
                          Member since {new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    {listing.provider.bio && (
                      <p className="mt-4 text-sm text-gray-600">{listing.provider.bio}</p>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-md font-medium text-gray-900">Business Owner</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Business details */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Category badge */}
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {listing.category}
                {listing.subcategory && ` / ${listing.subcategory}`}
              </span>
            </div>

            {/* Business name */}
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{businessName}</h1>

            {/* Rating or view count */}
            <div className="mt-3 flex items-center">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="ml-1 text-sm text-gray-600">
                  {listing.viewCount > 0 ? `${Math.floor(listing.viewCount)} views` : 'New listing'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">About this business</h3>
              <div className="mt-2 prose prose-sm text-gray-600">
                <p>{listing.description}</p>
              </div>
            </div>

            {/* Features/Highlights */}
            {listing.features?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Highlights</h3>
                <ul className="mt-3 grid grid-cols-1 gap-y-2 gap-x-6 sm:grid-cols-2">
                  {listing.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact information */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

              <div className="mt-4 space-y-4">
                {/* Email */}
                {(listing.contact?.email || listing.provider?.email) && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a
                      href={`mailto:${listing.contact?.email || listing.provider?.email}`}
                      onClick={() => handleContactClick('email')}
                      className="ml-2 text-blue-600 hover:text-blue-500"
                    >
                      {listing.contact?.email || listing.provider?.email}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {(listing.contact?.phone || listing.provider?.phoneNumber) && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a
                      href={`tel:${listing.contact?.phone || listing.provider?.phoneNumber}`}
                      onClick={() => handleContactClick('phone')}
                      className="ml-2 text-blue-600 hover:text-blue-500"
                    >
                      {listing.contact?.phone || listing.provider?.phoneNumber}
                    </a>
                  </div>
                )}

                {/* Alternate Phone */}
                {listing.contact?.alternatePhone && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a
                      href={`tel:${listing.contact.alternatePhone}`}
                      onClick={() => handleContactClick('alternatePhone')}
                      className="ml-2 text-blue-600 hover:text-blue-500"
                    >
                      {listing.contact.alternatePhone} (Alternate)
                    </a>
                  </div>
                )}

                {/* Website */}
                {listing.website && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleContactClick('website')}
                      className="ml-2 text-blue-600 hover:text-blue-500"
                    >
                      {listing.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* Location */}
                {listing.location && !listing.location.isRemote && listing.location.address && (
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="ml-2">
                      {listing.location.address.street && <p className="text-gray-600">{listing.location.address.street}</p>}
                      <p className="text-gray-600">
                        {[
                          listing.location.address.city,
                          listing.location.address.state,
                          listing.location.address.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      {listing.location.address.country && <p className="text-gray-600">{listing.location.address.country}</p>}
                    </div>
                  </div>
                )}

                {/* Remote Badge */}
                {listing.location?.isRemote && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2 text-gray-600">Remote/Online Business</span>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {listing.socialMedia && Object.values(listing.socialMedia).some(val => val) && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Social Media</h4>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {listing.socialMedia.facebook && (
                      <a
                        href={listing.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('facebook')}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {listing.socialMedia.twitter && (
                      <a
                        href={listing.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('twitter')}
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {listing.socialMedia.instagram && (
                      <a
                        href={listing.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('instagram')}
                        className="text-gray-400 hover:text-pink-500"
                      >
                        <span className="sr-only">Instagram</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {listing.socialMedia.linkedin && (
                      <a
                        href={listing.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('linkedin')}
                        className="text-gray-400 hover:text-blue-700"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {listing.socialMedia.youtube && (
                      <a
                        href={listing.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('youtube')}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <span className="sr-only">YouTube</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {listing.faqs?.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                  <div className="mt-4 space-y-4">
                    {listing.faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="flex justify-between items-center w-full text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                          <svg
                            className={`h-5 w-5 text-gray-500 transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {expandedFaq === index && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {listing.tags?.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Listings */}
          {relatedListings.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900">Related Businesses</h2>
              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedListings.map((related) => (
                  <div key={related.id} className="group relative">
                    <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                      {related.logo ? (
                        <img
                          src={related.logo}
                          alt={related.businessName}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-700">
                          <Link href={`/services/${related.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {related.businessName}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{related.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to directory button */}
          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
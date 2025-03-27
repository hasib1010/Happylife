'use client';
// src/app/profile/public/[id]/page.jsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/public/profile/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Profile not found');
          }
          throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        setProfile(data.user);
        setServices(data.services || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'An error occurred while loading this profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProfileData();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !profile) {
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
              <p className="text-sm text-red-700">{error || 'Profile not found'}</p>
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
  
  // Determine display name - business name takes precedence if it exists
  const displayName = profile.businessName || profile.name;
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Public Profile</h1>
            <Link
              href="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profile header with picture and name */}
          <div className="relative h-48 bg-blue-700">
            {/* Cover Image Background - subtle pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                  <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 20 L40 20" stroke="#fff" strokeWidth="1"/>
                    <path d="M20 0 L20 40" stroke="#fff" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pattern)" />
              </svg>
            </div>
            
            {/* Profile picture - positioned to overlap bottom edge */}
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                {profile.profilePicture ? (
                  // eslint-disable-next-line
                  <img 
                    src={profile.profilePicture}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile info */}
          <div className="px-8 pt-20 pb-8">
            <h2 className="text-3xl font-bold text-gray-900">{displayName}</h2>
            {profile.role === 'provider' && (
              <p className="mt-1 text-sm text-blue-600 font-medium">Business Owner</p>
            )}
            {profile.role === 'seller' && (
              <p className="mt-1 text-sm text-indigo-600 font-medium">Seller</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
            
            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Bio</h3>
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              </div>
            )}
            
            {/* Business Description (if available) */}
            {profile.businessDescription && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">About the Business</h3>
                <p className="mt-2 text-gray-600">{profile.businessDescription}</p>
              </div>
            )}
            
            {/* Categories */}
            {profile.categories && profile.categories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Business Categories</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {profile.email && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${profile.email}`} className="text-blue-600 hover:text-blue-500">
                        {profile.email}
                      </a>
                    </dd>
                  </div>
                )}
                
                {profile.phoneNumber && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${profile.phoneNumber}`} className="text-blue-600 hover:text-blue-500">
                        {profile.phoneNumber}
                      </a>
                    </dd>
                  </div>
                )}
                
                {profile.address && Object.values(profile.address).some(val => val) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile.address.city && profile.address.state && (
                        <p>
                          {profile.address.city}, {profile.address.state}
                          {profile.address.country ? `, ${profile.address.country}` : ''}
                        </p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
        
        {/* Business Listings */}
        {services.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900">Business Listings</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <Link href={`/services/${service.id}`}>
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {service.logo || service.coverImage ? (
                        <img
                          src={service.logo || service.coverImage}
                          alt={service.title || service.businessName}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.category}
                        </span>
                        {service.isFeatured && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {service.title || service.businessName}
                      </h3>
                      {service.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{service.description}</p>
                      )}
                      <div className="mt-4 text-sm text-blue-600 hover:text-blue-500 font-medium">
                        View listing →
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
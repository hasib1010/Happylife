'use client';
// src/app/profile/page.jsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [status, router]);
  
  // Fetch profile data when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.user);
      
      // Set image preview if profile picture exists
      if (data.user.profilePicture) {
        setImagePreview(data.user.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (like address.city)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Handle image upload first if there's a new image
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const { fileUrl } = await uploadResponse.json();
        
        // Update profile with new image URL
        profile.profilePicture = fileUrl;
      }
      
      // Update profile data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: profile }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!session) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profile header with picture and name */}
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 mr-4">
              {imagePreview ? (
                // eslint-disable-next-line
                <img 
                  src={imagePreview}
                  alt={profile?.name || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile?.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '-'}
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'business'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Business Profile
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Profile picture */}
                  <div className="sm:col-span-6">
                    <label htmlFor="profile-photo" className="block text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    <div className="mt-2 flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {imagePreview ? (
                          // eslint-disable-next-line
                          <img 
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-5">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Change</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Name */}
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profile?.name || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profile?.email || ''}
                        readOnly
                        disabled
                        className="bg-gray-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="sm:col-span-3">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={profile?.phoneNumber || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Role - Read only */}
                  <div className="sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Account Type
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value={profile?.role || 'user'}
                        readOnly
                        disabled
                        className="bg-gray-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="sm:col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={profile?.bio || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Brief description for your profile.</p>
                  </div>
                  
                  {/* Address Fields */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Address</h3>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.street"
                        id="address.street"
                        value={profile?.address?.street || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.city"
                        id="address.city"
                        value={profile?.address?.city || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.state"
                        id="address.state"
                        value={profile?.address?.state || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP / Postal Code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.zipCode"
                        id="address.zipCode"
                        value={profile?.address?.zipCode || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="mt-1">
                      <select
                        id="address.country"
                        name="address.country"
                        value={profile?.address?.country || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select a country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        {/* Add more countries as needed */}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Business Profile Tab */}
            {activeTab === 'business' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Business role information */}
                  {profile?.role === 'user' ? (
                    <div className="sm:col-span-6 bg-blue-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-blue-800">Upgrade your account</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>To create a business profile, you need to upgrade your account to a provider or seller.</p>
                            <Link href="/upgrade" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
                              Upgrade account →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="sm:col-span-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Business Information</h3>
                        <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly on your business listings.</p>
                      </div>
                      
                      {/* Business Name */}
                      <div className="sm:col-span-4">
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                          Business Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="businessName"
                            id="businessName"
                            value={profile?.businessName || ''}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      {/* Business Description */}
                      <div className="sm:col-span-6">
                        <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                          Business Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="businessDescription"
                            name="businessDescription"
                            rows={4}
                            value={profile?.businessDescription || ''}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Describe your business..."
                          />
                        </div>
                      </div>
                      
                      {/* Categories */}
                      <div className="sm:col-span-6">
                        <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                          Business Categories
                        </label>
                        <p className="mt-1 text-sm text-gray-500">Select the categories that best describe your business.</p>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {['Technology', 'Health & Wellness', 'Education', 'Finance', 'Food & Beverage', 'Retail', 'Professional Services', 'Real Estate', 'Events', 'Automotive', 'Home Services', 'Other'].map((category) => (
                            <div key={category} className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={`category-${category}`}
                                  name={`category-${category}`}
                                  type="checkbox"
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  checked={profile?.categories?.includes(category) || false}
                                  onChange={(e) => {
                                    let newCategories = [...(profile?.categories || [])];
                                    if (e.target.checked) {
                                      newCategories.push(category);
                                    } else {
                                      newCategories = newCategories.filter(c => c !== category);
                                    }
                                    setProfile({
                                      ...profile,
                                      categories: newCategories
                                    });
                                  }}
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={`category-${category}`} className="font-medium text-gray-700">
                                  {category}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Business Dashboard link */}
                      <div className="sm:col-span-6 mt-4">
                        <Link 
                          href="/dashboard" 
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Go to Business Dashboard
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Subscription Status */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Subscription Status</h3>
                    
                    {profile?.isSubscribed ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Active Subscription</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <div className="space-y-1">
                                <p>Plan: {profile.subscriptionPlan || 'Standard'}</p>
                                <p>Status: {profile.subscriptionStatus || 'Active'}</p>
                                {profile.subscriptionEnd && (
                                  <p>
                                    Renewal Date: {new Date(profile.subscriptionEnd).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                              
                              <div className="mt-4 flex space-x-3">
                                <Link
                                  href="/billing"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Manage Subscription
                                </Link>
                                <Link
                                  href="/billing/invoices"
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  View Invoices
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-800">No Active Subscription</h3>
                            <div className="mt-2 text-sm text-gray-700">
                              <p>Subscribe to our premium plans to unlock all features and create business listings.</p>
                              
                              <div className="mt-4">
                                <Link
                                  href="/pricing"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  View Pricing Plans
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Subscription Features */}
                  <div className="sm:col-span-6 mt-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Plan Features</h3>
                    
                    <div className="mt-2 border-t border-b border-gray-200">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Business listings</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {profile?.isSubscribed ? 
                              (profile.subscriptionPlan === 'premium' ? 'Unlimited' : '5') : 
                              'None'}
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Featured listings</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {profile?.isSubscribed ? 
                              (profile.subscriptionPlan === 'premium' ? '3' : '1') : 
                              'None'}
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Customer analytics</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {profile?.isSubscribed ? 
                              (profile.subscriptionPlan === 'premium' ? 'Advanced' : 'Basic') : 
                              'None'}
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Support</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {profile?.isSubscribed ? 
                              (profile.subscriptionPlan === 'premium' ? 'Priority' : 'Standard') : 
                              'Community'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Change Password */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your password to keep your account secure.
                    </p>
                    
                    {profile?.googleId ? (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Google Sign-In Account</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Your account uses Google for authentication. Password management is handled through your Google account settings.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <div className="mt-1">
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <div className="mt-1">
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <div className="mt-1">
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => toast.error('This functionality is not implemented in this demo')}
                          >
                            Update Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Account Security */}
                  <div className="sm:col-span-6 mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Account Security</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage additional security settings for your account.
                    </p>
                    
                    <div className="mt-4">
                      {/* Email Verification Status */}
                      <div className="flex items-start py-4">
                        <div className="flex-shrink-0">
                          {profile?.isVerified ? (
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                          <p className="text-sm text-gray-500">
                            {profile?.isVerified 
                              ? 'Your email has been verified.' 
                              : 'Your email is not verified. Verify your email to secure your account.'}
                          </p>
                          {!profile?.isVerified && (
                            <button
                              type="button"
                              className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                              onClick={() => toast.error('This functionality is not implemented in this demo')}
                            >
                              Resend verification email
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Two-Factor Authentication */}
                      <div className="flex items-start py-4 border-t border-gray-200">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">
                            Enable two-factor authentication for an extra layer of security when signing in.
                          </p>
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => toast.error('This functionality is not implemented in this demo')}
                          >
                            Set up 2FA
                          </button>
                        </div>
                      </div>
                      
                      {/* Recent Login Activity */}
                      <div className="flex items-start py-4 border-t border-gray-200">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Login Activity</h4>
                          <p className="text-sm text-gray-500">
                            Review your recent login history and get notified of suspicious activity.
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                            onClick={() => toast.error('This functionality is not implemented in this demo')}
                          >
                            View activity log
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => fetchProfile()}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
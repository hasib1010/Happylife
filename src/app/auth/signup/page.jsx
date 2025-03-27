'use client';
// src/app/auth/signup/page.js
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, user, loading, isAuthenticated } = useAuth();
  
  const initialRole = searchParams.get('role') || 'provider';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    businessName: '',
    businessDescription: '',
    serviceCategory: '',
    credentials: '',
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Update role when searchParams change
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: initialRole }));
  }, [initialRole]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Practice/Business name is required';
    }

    if (!formData.serviceCategory) {
      newErrors.serviceCategory = 'Please select a wellness category';
    }

    if (formData.role === 'provider' && selectedSpecialties.length === 0) {
      newErrors.specialties = 'Please select at least one specialty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(item => item !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create complete userData object
    const userData = {
      ...formData,
      specialties: selectedSpecialties,
      categories: [formData.serviceCategory]
    };

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      // Use the signup function from auth context
      const result = await signup(userData);

      if (result.success) {
        // If signup was successful, show success toast
        toast.success('Account created successfully!');
        
        // Redirect to success page with user info
        const params = new URLSearchParams({
          name: encodeURIComponent(userData.name),
          email: encodeURIComponent(userData.email),
          role: userData.role
        });
        
        router.push(`/auth/signup/success?${params.toString()}`);
      } else {
        setServerError(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error("Signup error:", error);
      setServerError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Wellness categories based on the platform description
  const wellnessCategories = [
    'Holistic Medicine',
    'Nutrition & Supplements',
    'Mental Health & Therapy',
    'Alternative Medicine',
    'Physical Wellness',
    'Energy Healing',
    'Mind-Body Practices',
    'Functional Medicine',
    'Natural Remedies',
    'Preventive Health'
  ];

  // Specialties for providers
  const providerSpecialties = [
    'Acupuncture',
    'Hypnotherapy',
    'Naturopathy',
    'Functional Medicine',
    'Ayurveda',
    'Massage Therapy',
    'Nutritional Counseling',
    'Yoga Therapy',
    'Meditation Coaching',
    'Herbal Medicine',
    'Chiropractic Care',
    'Reiki',
    'Sound Healing',
    'Life Coaching',
    'Aromatherapy'
  ];

  // Product categories for sellers
  const productCategories = [
    'Herbal Supplements',
    'Essential Oils',
    'Natural Beauty',
    'Organic Foods',
    'Meditation Tools',
    'Fitness Equipment',
    'Wellness Books',
    'Teas & Tonics',
    'Healing Crystals',
    'Eco-Friendly Products',
    'Massage Tools',
    'Wellness Technology',
    'Aromatherapy Products'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and platform name */}
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mt-3 text-center text-2xl font-bold text-teal-800">
          happylife.services
        </h1>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Join Our Wellness Network
        </h2>
        <p className="mt-2 text-center text-md text-gray-600 max-w-md mx-auto">
          Connect with health-conscious individuals seeking holistic wellness solutions
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-teal-600 hover:text-teal-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
          {/* Role Selection Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm">
              <Link
                href="/auth/signup?role=provider"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  formData.role === 'provider'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Wellness Provider
              </Link>
              <Link
                href="/auth/signup?role=seller"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  formData.role === 'seller'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-l-0 border-gray-300'
                }`}
              >
                Wellness Products
              </Link>
            </div>
          </div>

          {/* Explanatory text based on role */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">
              {formData.role === 'provider' 
                ? 'Join as a practitioner, therapist, or wellness service provider'
                : 'List your natural health products, supplements, or wellness tools'}
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{serverError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6 bg-gradient-to-r from-teal-50 to-green-50 p-4 rounded-md border border-teal-100 shadow-sm">
              <h3 className="text-lg font-medium text-teal-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Account Details
              </h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-md border border-teal-100 shadow-sm">
              <h3 className="text-lg font-medium text-teal-900 flex items-center">
                {formData.role === 'provider' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Practice Details
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Product Business Details
                  </>
                )}
              </h3>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'provider' ? 'Practice/Business Name' : 'Business Name'}
                </label>
                <div className="mt-1">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder={formData.role === 'provider' ? "e.g. Harmony Wellness Center" : "e.g. Natural Vitality Products"}
                  />
                  {errors.businessName && <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>}
                </div>
              </div>

              {formData.role === 'provider' && (
                <div>
                  <label htmlFor="credentials" className="block text-sm font-medium text-gray-700">
                    Certifications/Credentials
                  </label>
                  <div className="mt-1">
                    <input
                      id="credentials"
                      name="credentials"
                      type="text"
                      value={formData.credentials}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="e.g. ND, L.Ac, LMFT, RYT-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">List your professional certifications or licenses</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'provider' ? 'Primary Category' : 'Product Category'}
                </label>
                <div className="mt-1">
                  <select
                    id="serviceCategory"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.serviceCategory ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  >
                    <option value="">Select a category</option>
                    {formData.role === 'provider' 
                      ? wellnessCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      : productCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                    }
                  </select>
                  {errors.serviceCategory && <p className="mt-2 text-sm text-red-600">{errors.serviceCategory}</p>}
                </div>
              </div>

              {formData.role === 'provider' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {providerSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`specialty-${specialty}`}
                            name="specialties"
                            type="checkbox"
                            checked={selectedSpecialties.includes(specialty)}
                            onChange={() => handleSpecialtyChange(specialty)}
                            className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-2 text-sm">
                          <label htmlFor={`specialty-${specialty}`} className="font-medium text-gray-700">
                            {specialty}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.specialties && <p className="mt-2 text-sm text-red-600">{errors.specialties}</p>}
                </div>
              )}

              <div>
                <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'provider' ? 'Practice Description' : 'Business Description'}
                </label>
                <div className="mt-1">
                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    rows={3}
                    value={formData.businessDescription}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder={formData.role === 'provider' 
                      ? "Describe your practice, approach, and the services you offer..." 
                      : "Describe your products, philosophy, and what makes them unique..."}
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {formData.role === 'provider'
                      ? 'As a wellness provider, you\'ll be able to list your services, connect with clients seeking holistic health solutions, and grow your practice.'
                      : 'As a wellness product seller, you\'ll be able to showcase your natural remedies and health products to our community of health-conscious individuals.'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating your wellness profile...' : 'Join happylife.services'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
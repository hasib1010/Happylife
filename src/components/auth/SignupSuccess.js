'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';

export default function SignupSuccess() {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // Get user info from URL params
  const name = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')) : '';
  const email = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')) : '';
  const role = searchParams.get('role') || '';

  useEffect(() => {
    // Store new registration flag in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('newRegistration', 'true');
    }

    // Set up countdown for automatic redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // Redirect based on role with newRegistration flag
          if (role === 'provider' || role === 'seller') {
            router.push('/subscription?newRegistration=true');
          } else {
            router.push('/dashboard?newRegistration=true');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, role]);

  // Handle immediate manual navigation
  const handleContinue = () => {
    if (role === 'provider' || role === 'seller') {
      router.push('/subscription?newRegistration=true');
    } else {
      router.push('/dashboard?newRegistration=true');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Account Created Successfully!</h2>
      </div>
      <div className="px-6 py-8">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-6">
          Congratulations, <strong>{name}</strong>! Your account has been created successfully.
        </p>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} seconds...
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleContinue}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 text-center"
          >
            Continue Now
          </button>
          
          {(role === 'provider' || role === 'seller') && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                As a {role}, you'll need to set up your subscription next to list your {role === 'provider' ? 'services' : 'products'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
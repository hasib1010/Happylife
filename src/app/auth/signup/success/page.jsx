'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SignupSuccess from '@/components/auth/SignupSuccess';

export default function SignupSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState(null);
  
  // Get user data from URL params
  useEffect(() => {
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    
    if (email && name) {
      setUserData({
        email,
        name,
        role: role || 'user'
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-green-500 p-2 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Registration Complete</h1>
          <p className="mt-2 text-gray-600">Your account has been created successfully.</p>
        </div>
        
        <SignupSuccess user={userData} />
      </div>
    </div>
  );
}
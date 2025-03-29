'use client';
// src/app/auth/signin/page.js
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/components/auth/AuthProvider';

// Content component that uses searchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  // Redirect if already authenticated through either method
  useEffect(() => {
    if ((sessionStatus === 'authenticated' || isAuthenticated) && !authLoading && sessionStatus !== 'loading') {
      router.push(callbackUrl);
    }
  }, [sessionStatus, isAuthenticated, authLoading, router, callbackUrl]);

  // Show loading state while checking authentication
  if (sessionStatus === 'loading' || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don&apos;t have an account yet?{' '}
          <Link href="/auth/signup" className="font-medium text-teal-600 hover:text-teal-500">
            Join our wellness network
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
          {/* Error message from URL param */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error === 'CredentialsSignin'
                      ? 'Invalid email or password'
                      : 'An error occurred during sign in'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <LoginForm />
        </div>
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-sm font-medium text-gray-500">
          Are you a wellness practitioner or product seller?
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Join our network and connect with clients looking for holistic health solutions.
        </p>
        <div className="mt-3">
          <Link
            href="/auth/signup?role=provider"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
          >
            Sign up as a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function SignInLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mt-3 text-center text-2xl font-bold text-teal-800">
          happylife.services
        </h1>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Loading...
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
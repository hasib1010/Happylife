'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    passwordsMatch: false
  });
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  useEffect(() => {
    // Validate password as user types
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      passwordsMatch: password === confirmPassword && password !== ''
    });
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Final validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (
      !passwordValidation.hasMinLength ||
      !passwordValidation.hasUpperCase ||
      !passwordValidation.hasLowerCase ||
      !passwordValidation.hasNumber
    ) {
      setErrorMessage('Password does not meet all requirements');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register({ name, email, password });
      
      if (result.success) {
        setSuccessMessage('Registration successful! You can now log in.');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errorMessage}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {successMessage}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-600">Password must contain:</p>
            <ul className="text-xs space-y-1">
              <li className={`flex items-center ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                At least one uppercase letter
              </li>
              <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                At least one lowercase letter
              </li>
              <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                At least one number
              </li>
              <li className={`flex items-center ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordValidation.passwordsMatch ? '✓' : '○'}</span>
                Passwords match
              </li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-600">
            By registering, you agree to our{' '}
            <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
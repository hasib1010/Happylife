'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    passwordsMatch: false
  });
  
  useEffect(() => {
    // Get token from URL
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setErrorMessage('Reset token is missing. Please use the link from your email.');
    }
  }, [searchParams]);
  
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Your password has been reset successfully!');
        // Clear the form
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password. The token may be invalid or expired.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
      console.error('Password reset error:', error);
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please choose a new password for your account
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
                <p className="mt-2 text-sm text-green-700">
                  You will be redirected to the login page shortly.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!successMessage && token && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm pr-10"
                    placeholder="New password"
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
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        <div className="flex items-center justify-center mt-6">
          <Link href="/auth/login" className="flex items-center text-sm text-emerald-600 hover:text-emerald-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
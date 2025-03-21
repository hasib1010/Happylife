'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { AlertCircle, CheckCircle2, Camera, User, Shield, Mail, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  
  // General profile state
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('profile');

  // Load user data when available
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/dashboard/profile');
      return;
    }
    
    if (user) {
      setName(user.name || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user, loading, isAuthenticated, router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await updateProfile({ name, profileImage });
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
      } else {
        setErrorMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      setIsChangingPassword(false);
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setPasswordSuccess('Password changed successfully!');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Settings
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your personal information and account preferences
              </p>
            </div>
            
            {/* Tab navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 flex items-center ${
                    activeTab === 'profile'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 flex items-center ${
                    activeTab === 'security'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </button>
              </nav>
            </div>
            
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="px-4 py-5 sm:p-6">
                {errorMessage && (
                  <div className="rounded-md bg-red-50 p-4 mb-6">
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
                  <div className="rounded-md bg-green-50 p-4 mb-6">
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
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 relative">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="h-10 w-10" />
                        )}
                        <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer text-gray-500 hover:text-emerald-500">
                          <Camera className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-5">
                        <div className="text-sm font-medium text-gray-500">Profile Picture</div>
                        <div className="text-xs text-gray-400 mt-1">JPG, GIF or PNG. Max size 2MB</div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                          disabled
                          value={user?.email || ''}
                          readOnly
                        />
                        {user?.isEmailVerified ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Not Verified
                          </span>
                        )}
                      </div>
                      {!user?.isEmailVerified && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Resend Verification Email
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="account-type" className="block text-sm font-medium text-gray-700">
                        Account Type
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="account-type"
                          id="account-type"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                          disabled
                          value={user?.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : 'Regular'}
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security tab */}
            {activeTab === 'security' && (
              <div className="px-4 py-5 sm:p-6">
                {passwordError && (
                  <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {passwordError}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="rounded-md bg-green-50 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          {passwordSuccess}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordError('');
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                        >
                          {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Two-Factor Authentication</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                    
                    <div className="mt-4">
                      <button 
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        <Shield className="mr-2 h-5 w-5 text-gray-500" />
                        Set up two-factor authentication
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
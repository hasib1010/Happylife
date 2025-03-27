// src/lib/auth-functions.js
import { signIn, signOut } from 'next-auth/react';

/**
 * Register a new user
 * @param {Object} userData - User data including name, email, password, and role
 * @returns {Promise<Object>} - Response with success status and user data or error message
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in a user with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} callbackUrl - URL to redirect to after successful sign-in
 * @returns {Promise<Object>} - Response with success status and redirect URL or error message
 */
export const loginWithCredentials = async (email, password, callbackUrl = '/dashboard') => {
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return { success: true, url: callbackUrl };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in a user with Google
 * @param {string} callbackUrl - URL to redirect to after successful sign-in
 */
export const loginWithGoogle = (callbackUrl = '/dashboard') => {
  signIn('google', { callbackUrl });
};

/**
 * Sign out the current user
 * @param {string} callbackUrl - URL to redirect to after sign-out
 */
export const logoutUser = (callbackUrl = '/') => {
  signOut({ callbackUrl });
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} - Response with success status and updated user data or error message
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Profile update failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} - Response with success status and user data or error message
 */
export const getUserProfile = async () => {
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }

    return { success: true, data: data.user };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a subscription for a provider or seller
 * @returns {Promise<Object>} - Response with success status and checkout URL or error message
 */
export const createSubscription = async () => {
  try {
    const response = await fetch('/api/subscription/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create subscription');
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('Subscription creation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify a subscription after checkout
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} - Response with success status or error message
 */
export const verifySubscription = async (sessionId) => {
  try {
    const response = await fetch('/api/subscription/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify subscription');
    }

    return { success: true };
  } catch (error) {
    console.error('Subscription verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if the current user has an active subscription
 * @returns {Promise<Object>} - Response with success status and subscription status or error message
 */
export const checkSubscriptionStatus = async () => {
  try {
    const response = await fetch('/api/subscription/status');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check subscription status');
    }

    return { 
      success: true, 
      isActive: data.isActive,
      subscriptionData: data.subscription
    };
  } catch (error) {
    console.error('Subscription status check error:', error);
    return { success: false, error: error.message };
  }
};
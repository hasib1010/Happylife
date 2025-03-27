'use client';

// Get auth token from localStorage or cookie
export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage and cookie
export const setAuthToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Store in localStorage
  localStorage.setItem('auth_token', token);
  
  // Store in cookie for middleware access
  document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Strict`;
};

// Remove auth token from localStorage and cookie
export const removeAuthToken = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Remove from localStorage
  localStorage.removeItem('auth_token');
  
  // Clear the cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
};

// Get authorization headers for API requests
export const getAuthHeaders = () => {
  const token = getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to fetch with authentication
export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};
// src/utils/authUtils.js
// Authentication utility functions

// Function to validate JWT token format
export const isValidJWTFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64 encoded (basic check)
  try {
    for (const part of parts) {
      if (part.length === 0) return false;
      // Try to decode base64 (will throw if invalid)
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Function to clean up invalid tokens
export const cleanupInvalidToken = () => {
  const token = localStorage.getItem('token');
  
  if (token && !isValidJWTFormat(token)) {
    console.warn('Invalid JWT token found, removing from localStorage');
    localStorage.removeItem('token');
    return true; // Token was cleaned up
  }
  
  return false; // No cleanup needed
};

// Function to safely get token
export const getSafeToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return null;
  
  if (!isValidJWTFormat(token)) {
    console.warn('Invalid token format, removing from localStorage');
    localStorage.removeItem('token');
    return null;
  }
  
  return token;
};

// Function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken'); // if you use refresh tokens
  console.log('All authentication data cleared');
};

// Function to handle authentication errors
export const handleAuthError = (error, redirectToLogin = true) => {
  console.error('Authentication error:', error);
  
  // Clear auth data on authentication errors
  clearAuthData();
  
  // Redirect to login if needed
  if (redirectToLogin && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getSafeToken();
  return !!token;
};

export default {
  isValidJWTFormat,
  cleanupInvalidToken,
  getSafeToken,
  clearAuthData,
  handleAuthError,
  isAuthenticated
}; 
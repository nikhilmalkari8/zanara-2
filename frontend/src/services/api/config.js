// src/services/api/config.js
import { validateAndCleanupToken } from '../../components/shared/TokenCleanup';

const API_BASE_URL = 'http://localhost:8001/api';

// Helper function to validate JWT token format
const isValidJWTFormat = (token) => {
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

// Helper function to get the authentication token (with aggressive validation)
export const getAuthToken = () => {
  // Use the aggressive validation utility
  return validateAndCleanupToken();
};

// Helper function to build headers with authentication
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header if we have a valid token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to build multipart form headers (for file uploads)
export const getMultipartHeaders = () => {
  const token = getAuthToken();
  const headers = {};
  
  // Only add Authorization header if we have a valid token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Note: Do not set Content-Type for multipart form data
  return headers;
};

// Basic API request function with error handling
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, options);
    
    // Parse the JSON response if possible
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Check if the request was successful
    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        console.warn('Authentication failed, clearing all tokens...');
        // Import and use force cleanup
        const { forceCleanupAllTokens } = await import('../../components/shared/TokenCleanup');
        forceCleanupAllTokens();
        
        // Redirect to login if we're not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Format error message
      const errorMessage = data.message || data.error || 'An unknown error occurred';
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Create a properly structured export object
const apiConfig = {
  apiRequest,
  getAuthHeaders,
  getMultipartHeaders,
  getAuthToken,
  isValidJWTFormat,
  API_BASE_URL
};

export default apiConfig;
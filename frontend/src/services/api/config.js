// src/services/api/config.js

const API_BASE_URL = 'http://localhost:8001/api';

// Helper function to get the authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to build headers with authentication
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Helper function to build multipart form headers (for file uploads)
export const getMultipartHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : ''
    // Note: Do not set Content-Type for multipart form data
  };
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

export default {
  apiRequest,
  getAuthHeaders,
  getMultipartHeaders,
  getAuthToken,
  API_BASE_URL
};
// src/services/api/authService.js
import { apiRequest, getAuthHeaders } from './config';

// User login
export const login = async (email, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  // Store the token if provided
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
};

// User registration
export const register = async (userData) => {
  return await apiRequest('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
};

// Get current user profile
export const getCurrentUser = async () => {
  return await apiRequest('/auth/me', {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Logout user (client-side)
export const logout = () => {
  localStorage.removeItem('token');
  // You might want to clear other stored data here
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Convert to boolean
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated
};
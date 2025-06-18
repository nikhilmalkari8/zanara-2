// src/services/api/profileService.js
import { apiRequest, getAuthHeaders, getMultipartHeaders } from './config';

// Get professional types
export const getProfessionalTypes = async () => {
  return await apiRequest('/auth/professional-types', {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Get current user's professional profile
export const getCurrentProfile = async () => {
  return await apiRequest('/professional-profile/me', {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Get a specific user's profile by ID
export const getProfileById = async (userId) => {
  return await apiRequest(`/professional-profile/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Complete/create professional profile
export const completeProfile = async (profileData) => {
  return await apiRequest('/professional-profile/complete', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
};

// Update professional profile
export const updateProfile = async (profileData) => {
  return await apiRequest('/professional-profile/update', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  return await apiRequest('/professional-profile/picture', {
    method: 'PUT',
    headers: getMultipartHeaders(),
    body: formData
  });
};

// Upload portfolio photos
export const uploadPortfolioPhotos = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('portfolioPhotos', file);
  });
  
  return await apiRequest('/professional-profile/photos', {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
};

// Search profiles with filters
export const searchProfiles = async (filters = {}) => {
  // Convert filters object to query string
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  return await apiRequest(`/profile/browse?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

export default {
  getProfessionalTypes,
  getCurrentProfile,
  getProfileById,
  completeProfile,
  updateProfile,
  uploadProfilePicture,
  uploadPortfolioPhotos,
  searchProfiles
};
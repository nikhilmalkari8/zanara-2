// src/services/api/connectionService.js
import { apiRequest, getAuthHeaders } from './config';

// Get user connections
export const getConnections = async () => {
  return await apiRequest('/connections/my-connections', {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Send connection request
export const sendConnectionRequest = async (receiverId, message = '', receiverType = '') => {
  return await apiRequest('/connections/request', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ receiverId, message, receiverType })
  });
};

// Get connection status with specific user
export const getConnectionStatus = async (userId) => {
  return await apiRequest(`/connections/status/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

// Accept connection request
export const acceptConnection = async (connectionId) => {
  return await apiRequest(`/connections/${connectionId}/accept`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
};

// Reject connection request
export const rejectConnection = async (connectionId) => {
  return await apiRequest(`/connections/${connectionId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
};

// Get pending connection requests
export const getPendingRequests = async () => {
  return await apiRequest('/connections/pending-requests', {
    method: 'GET',
    headers: getAuthHeaders()
  });
};

export default {
  getConnections,
  sendConnectionRequest,
  getConnectionStatus,
  acceptConnection,
  rejectConnection,
  getPendingRequests
};
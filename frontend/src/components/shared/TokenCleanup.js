// src/components/shared/TokenCleanup.js
// Aggressive token cleanup utility

export const validateAndCleanupToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null; // No token to validate
  }
  
  // Step 1: Basic type and format check
  if (typeof token !== 'string' || token.trim() === '') {
    console.warn('🧹 Token Cleanup: Invalid token type or empty token, removing...');
    localStorage.removeItem('token');
    return null;
  }
  
  // Step 2: Check JWT structure (must have exactly 3 parts)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn(`🧹 Token Cleanup: Invalid JWT structure (${parts.length} parts instead of 3), removing...`);
    localStorage.removeItem('token');
    return null;
  }
  
  // Step 3: Check for empty parts
  if (parts.some(part => !part || part.trim() === '')) {
    console.warn('🧹 Token Cleanup: JWT has empty parts, removing...');
    localStorage.removeItem('token');
    return null;
  }
  
  // Step 4: Validate base64 encoding of each part
  try {
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // Convert URL-safe base64 to regular base64
      const base64Part = part.replace(/-/g, '+').replace(/_/g, '/');
      
      // Try to decode - will throw if invalid
      atob(base64Part);
    }
  } catch (error) {
    console.warn('🧹 Token Cleanup: Invalid base64 encoding in JWT parts, removing...', error.message);
    localStorage.removeItem('token');
    return null;
  }
  
  // Step 5: Try to decode and validate payload structure
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if payload has required fields
    if (!payload.id && !payload.userId && !payload.sub) {
      console.warn('🧹 Token Cleanup: JWT payload missing user identifier, removing...');
      localStorage.removeItem('token');
      return null;
    }
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.warn('🧹 Token Cleanup: JWT token is expired, removing...');
      localStorage.removeItem('token');
      return null;
    }
    
  } catch (error) {
    console.warn('🧹 Token Cleanup: Cannot decode JWT payload, removing...', error.message);
    localStorage.removeItem('token');
    return null;
  }
  
  // If we get here, the token passed all validation checks
  console.log('✅ Token Cleanup: JWT token is valid');
  return token;
};

export const forceCleanupAllTokens = () => {
  console.log('🧹 Force Cleanup: Removing all authentication tokens...');
  
  // Remove all possible token-related items
  const keysToRemove = [
    'token',
    'authToken', 
    'jwt',
    'jwtToken',
    'accessToken',
    'access_token',
    'bearer_token',
    'user',
    'userData',
    'currentUser'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🧹 Removing: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Force cleanup completed');
};

export const debugTokenInfo = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('🔍 Debug: No token found in localStorage');
    return { valid: false, reason: 'No token found' };
  }
  
  const parts = token.split('.');
  const info = {
    tokenLength: token.length,
    parts: parts.length,
    partsLengths: parts.map(part => part.length),
    valid: false,
    reason: 'Unknown'
  };
  
  if (parts.length !== 3) {
    info.reason = `Invalid parts count: ${parts.length}`;
    return info;
  }
  
  if (parts.some(part => !part || part.trim() === '')) {
    info.reason = 'Empty parts detected';
    return info;
  }
  
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    info.payload = payload;
    info.valid = true;
    info.reason = 'Valid token';
  } catch (error) {
    info.reason = `Payload decode error: ${error.message}`;
  }
  
  console.log('🔍 Token Debug Info:', info);
  return info;
};

export default {
  validateAndCleanupToken,
  forceCleanupAllTokens,
  debugTokenInfo
}; 
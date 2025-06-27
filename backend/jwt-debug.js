#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8001';

async function debugJWT() {
  console.log('🔍 JWT Debug Tool for Zanara Platform\n');

  try {
    // Test user registration and login
    console.log('1. Testing user registration...');
    const userData = {
      firstName: 'Debug',
      lastName: 'User',
      email: `debug${Date.now()}@zanara.com`,
      phoneNumber: '+1234567890',
      password: 'DebugPassword123!',
      userType: 'talent',
      professionalType: 'model',
      workStatus: 'freelancer'
    };

    const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
    console.log('✅ Registration successful');

    // Test login
    console.log('2. Testing login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: userData.email,
      password: userData.password
    });

    if (!loginResponse.data.token) {
      console.log('❌ No token received from login');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('📝 Token received:', token.substring(0, 50) + '...');

    // Analyze token structure
    console.log('\n3. Analyzing token structure...');
    const tokenParts = token.split('.');
    console.log(`   Token parts: ${tokenParts.length}`);
    
    if (tokenParts.length !== 3) {
      console.log('❌ Invalid JWT structure - should have 3 parts');
      return;
    }

    // Decode token payload (without verification)
    try {
      const decoded = jwt.decode(token);
      console.log('✅ Token structure valid');
      console.log('📋 Token payload:', JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Failed to decode token:', error.message);
      return;
    }

    // Test token verification
    console.log('\n4. Testing token verification...');
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'a8f5f167f44f4964e6c998dee827110c85c1da73fcaa69213963a0d7e9a65d0c';
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('👤 User ID:', verified.id || verified.userId);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return;
    }

    // Test authenticated API call
    console.log('\n5. Testing authenticated API call...');
    try {
      const profileResponse = await axios.get(`${BACKEND_URL}/api/profile/my-complete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Authenticated API call successful');
    } catch (error) {
      console.log('❌ Authenticated API call failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 JWT debugging complete!');

  } catch (error) {
    console.log('❌ Debug failed:', error.response?.data?.message || error.message);
  }
}

// Run if called directly
if (require.main === module) {
  debugJWT().catch(console.error);
}

module.exports = debugJWT; 
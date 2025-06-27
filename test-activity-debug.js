#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8001';

async function testActivityCreation() {
  console.log('🧪 Testing Activity Creation...\n');

  try {
    // First, create a test user and get a token
    console.log('1. Creating test user...');
    const userData = {
      firstName: 'Activity',
      lastName: 'Tester',
      email: `activity${Date.now()}@zanara.com`,
      phoneNumber: '+1234567890',
      password: 'ActivityTest123!',
      userType: 'talent',
      professionalType: 'model',
      workStatus: 'freelancer'
    };

    await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
    console.log('✅ User created');

    // Login to get token
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: userData.email,
      password: userData.password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test activity creation with different payloads
    console.log('3. Testing activity creation...');

    const testCases = [
      {
        name: 'Basic Activity',
        data: {
          type: 'content_published',
          title: 'Test Activity',
          description: 'Test description',
          content: 'This is a test post',
          visibility: 'public'
        }
      },
      {
        name: 'Activity with Content Object',
        data: {
          type: 'content_published',
          title: 'Test Activity 2',
          description: 'Test description 2',
          content: {
            text: 'This is a test post with content object',
            hashtags: ['test', 'activity']
          },
          visibility: 'public'
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\n   Testing: ${testCase.name}`);
        const response = await axios.post(`${BACKEND_URL}/api/activity/create`, testCase.data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ ${testCase.name} - Success`);
      } catch (error) {
        console.log(`   ❌ ${testCase.name} - Failed:`, error.response?.data || error.message);
        
        // Log more details for debugging
        if (error.response?.status === 500) {
          console.log('   🔍 Detailed error:', error.response.data);
        }
      }
    }

    console.log('\n🎉 Activity creation testing complete!');

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testActivityCreation().catch(console.error);
}

module.exports = testActivityCreation; 
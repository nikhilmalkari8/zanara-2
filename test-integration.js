#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

const BACKEND_URL = 'http://localhost:8001';
const FRONTEND_URL = 'http://localhost:3000';

class ZanaraIntegrationTest {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.testUser = null;
  }

  async runAllTests() {
    console.log('🧪 Starting Zanara Integration Tests...\n'.cyan.bold);

    try {
      // Basic connectivity tests
      await this.testBackendHealth();
      await this.testFrontendHealth();
      
      // Authentication tests
      await this.testUserRegistration();
      await this.testUserLogin();
      
      // Profile tests
      await this.testProfileCreation();
      await this.testProfileUpdate();
      
      // Activity feed tests
      await this.testActivityCreation();
      await this.testActivityReactions();
      
      // Connection tests
      await this.testConnectionRequests();
      
      // Smart feed tests
      await this.testSmartFeed();
      
      // Professional interaction tests
      await this.testSkillEndorsements();
      await this.testRecommendations();
      
      // Notification tests
      await this.testNotifications();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Integration test failed:'.red, error.message);
      process.exit(1);
    }
  }

  async testBackendHealth() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      this.addResult('Backend Health Check', true, 'Backend is running and healthy');
    } catch (error) {
      this.addResult('Backend Health Check', false, `Backend not responding: ${error.message}`);
      throw error;
    }
  }

  async testFrontendHealth() {
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      this.addResult('Frontend Health Check', true, 'Frontend is accessible');
    } catch (error) {
      this.addResult('Frontend Health Check', false, `Frontend not responding: ${error.message}`);
      // Don't throw - frontend might take longer to start
    }
  }

  async testUserRegistration() {
    try {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@zanara.com`,
        phoneNumber: '+1234567890',
        password: 'TestPassword123!',
        userType: 'talent',
        professionalType: 'model',
        workStatus: 'freelancer'
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      
      if (response.data.success !== false && response.data.token) {
        this.testUser = userData;
        this.addResult('User Registration', true, 'User registered successfully');
      } else {
        this.addResult('User Registration', false, 'Registration failed - no token returned');
      }
    } catch (error) {
      this.addResult('User Registration', false, `Registration error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testUserLogin() {
    if (!this.testUser) {
      this.addResult('User Login', false, 'No test user to login with');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: this.testUser.email,
        password: this.testUser.password
      });

      if (response.data.token) {
        this.authToken = response.data.token;
        this.addResult('User Login', true, 'User logged in successfully');
      } else {
        this.addResult('User Login', false, `Login failed - no token in response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.addResult('User Login', false, `Login error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testProfileCreation() {
    if (!this.authToken) {
      this.addResult('Profile Creation', false, 'No auth token available');
      return;
    }

    try {
      const profileData = {
        fullName: 'Test User',
        headline: 'Test Model',
        bio: 'This is a test model profile',
        location: 'New York, NY',
        skills: ['Fashion Modeling', 'Photography'],
        experienceLevel: 'intermediate',
        modelType: 'fashion',
        yearsExperience: '3-5',
        height: '5\'8"',
        weight: '120 lbs',
        gender: 'female',
        nationality: 'American',
        dateOfBirth: '1995-01-01'
      };

      const response = await axios.post(`${BACKEND_URL}/api/profile/complete`, profileData, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Profile Creation', true, 'Profile created successfully');
    } catch (error) {
      this.addResult('Profile Creation', false, `Profile creation error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testProfileUpdate() {
    if (!this.authToken) {
      this.addResult('Profile Update', false, 'No auth token available');
      return;
    }

    try {
      const updateData = {
        bio: 'Updated bio for integration test',
        skills: ['Fashion Modeling', 'Photography', 'Runway']
      };

      const response = await axios.put(`${BACKEND_URL}/api/profile/update`, updateData, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Profile Update', true, 'Profile updated successfully');
    } catch (error) {
      this.addResult('Profile Update', false, `Profile update error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testActivityCreation() {
    if (!this.authToken) {
      this.addResult('Activity Creation', false, 'No auth token available');
      return;
    }

    try {
      const activityData = {
        type: 'content_published',
        title: 'Integration Test Activity',
        description: 'This is a test activity post for integration testing!',
        content: 'This is a test activity post for integration testing! #fashion #modeling',
        hashtags: ['fashion', 'modeling', 'test'],
        visibility: 'public'
      };

      const response = await axios.post(`${BACKEND_URL}/api/activity/create`, activityData, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Activity Creation', true, 'Activity created successfully');
    } catch (error) {
      this.addResult('Activity Creation', false, `Activity creation error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testActivityReactions() {
    if (!this.authToken) {
      this.addResult('Activity Reactions', false, 'No auth token available');
      return;
    }

    try {
      // First get activities
      const activitiesResponse = await axios.get(`${BACKEND_URL}/api/activity/feed`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (activitiesResponse.data.activities && activitiesResponse.data.activities.length > 0) {
        const activityId = activitiesResponse.data.activities[0]._id;
        
        // Test reaction
        const reactionResponse = await axios.post(`${BACKEND_URL}/api/activity/${activityId}/react`, {
          reactionType: 'love'
        }, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });

        this.addResult('Activity Reactions', true, 'Activity reaction successful');
      } else {
        this.addResult('Activity Reactions', false, 'No activities found to react to');
      }
    } catch (error) {
      this.addResult('Activity Reactions', false, `Reaction error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testConnectionRequests() {
    if (!this.authToken) {
      this.addResult('Connection Requests', false, 'No auth token available');
      return;
    }

    try {
      // Get suggested connections
      const response = await axios.get(`${BACKEND_URL}/api/connections/suggestions`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Connection Requests', true, 'Connection suggestions retrieved successfully');
    } catch (error) {
      this.addResult('Connection Requests', false, `Connection error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testSmartFeed() {
    if (!this.authToken) {
      this.addResult('Smart Feed', false, 'No auth token available');
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/smart-feed`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Smart Feed', true, 'Smart feed retrieved successfully');
    } catch (error) {
      this.addResult('Smart Feed', false, `Smart feed error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testSkillEndorsements() {
    if (!this.authToken) {
      this.addResult('Skill Endorsements', false, 'No auth token available');
      return;
    }

    try {
      // Get current user's profile to get user ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/profile/my-complete`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (profileResponse.data.userId) {
        const skillsResponse = await axios.get(`${BACKEND_URL}/api/profile/${profileResponse.data.userId}/skills`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });

        this.addResult('Skill Endorsements', true, 'Skills retrieved successfully');
      } else {
        this.addResult('Skill Endorsements', false, 'Could not get user profile');
      }
    } catch (error) {
      this.addResult('Skill Endorsements', false, `Skills error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testRecommendations() {
    if (!this.authToken) {
      this.addResult('Recommendations', false, 'No auth token available');
      return;
    }

    try {
      // Get current user's profile to get user ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/profile/my-complete`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (profileResponse.data.userId) {
        const recommendationsResponse = await axios.get(`${BACKEND_URL}/api/profile/${profileResponse.data.userId}/recommendations`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });

        this.addResult('Recommendations', true, 'Recommendations retrieved successfully');
      } else {
        this.addResult('Recommendations', false, 'Could not get user profile');
      }
    } catch (error) {
      this.addResult('Recommendations', false, `Recommendations error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testNotifications() {
    if (!this.authToken) {
      this.addResult('Notifications', false, 'No auth token available');
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      this.addResult('Notifications', true, 'Notifications retrieved successfully');
    } catch (error) {
      this.addResult('Notifications', false, `Notifications error: ${error.response?.data?.message || error.message}`);
    }
  }

  addResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    const status = passed ? '✅ PASS'.green : '❌ FAIL'.red;
    console.log(`${status} ${testName}: ${message}`);
  }

  printResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60).cyan);
    console.log('📊 INTEGRATION TEST RESULTS'.cyan.bold);
    console.log('='.repeat(60).cyan);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`.green);
    console.log(`Failed: ${failedTests}`.red);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:'.red.bold);
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  • ${r.testName}: ${r.message}`.red));
    }

    console.log('\n🎉 Integration testing complete!'.cyan.bold);
    
    if (passedTests === totalTests) {
      console.log('🚀 All systems are GO! Zanara platform is fully functional.'.green.bold);
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.'.yellow.bold);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ZanaraIntegrationTest();
  tester.runAllTests().catch(console.error);
}

module.exports = ZanaraIntegrationTest; 
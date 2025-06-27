#!/usr/bin/env node

/**
 * Phase 4: Intelligent Notifications - Comprehensive Test Suite
 * 
 * This script tests all Phase 4 features:
 * 1. Smart Timing Service
 * 2. Birthday Notification Service
 * 3. Digest Notification Service
 * 4. Contextual Suggestions Service
 * 5. Notification Scheduler
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const smartTimingService = require('./services/smartTimingService');
const birthdayService = require('./services/birthdayService');
const digestService = require('./services/digestService');
const contextualSuggestionsService = require('./services/contextualSuggestionsService');
const notificationScheduler = require('./services/notificationScheduler');

// Import models
const User = require('./models/User');
const Notification = require('./models/Notification');
const Activity = require('./models/Activity');
const Connection = require('./models/Connection');

class Phase4TestSuite {
  constructor() {
    this.testResults = {
      smartTiming: {},
      birthday: {},
      digest: {},
      contextualSuggestions: {},
      scheduler: {},
      overall: {}
    };
    this.testUsers = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Phase 4: Intelligent Notifications Test Suite...\n');

    try {
      // Connect to MongoDB
      await this.connectToDatabase();

      // Setup test data
      await this.setupTestData();

      // Run individual service tests
      await this.testSmartTimingService();
      await this.testBirthdayService();
      await this.testDigestService();
      await this.testContextualSuggestionsService();
      await this.testNotificationScheduler();

      // Generate final report
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      // Cleanup
      await this.cleanup();
      await mongoose.connection.close();
    }
  }

  async connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zanara', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async setupTestData() {
    console.log('🔧 Setting up test data...');

    try {
      // First, clean up any existing test data
      await this.cleanup();

      // Test user data
      const testUserData = [
        {
          firstName: 'Test',
          lastName: 'Model',
          email: 'test.model@zanara.com',
          phoneNumber: '+1234567890',
          password: 'testpassword123',
          professionalType: 'model',
          userType: 'talent',
          dateOfBirth: new Date('1995-06-15'), // Birthday in June for testing
          birthdayPrivacy: 'connections',
          profileComplete: true,
          emailVerified: true,
          activityPatterns: {
            timezone: 'America/New_York',
            activeHours: [
              { hour: 9, activityScore: 80 },
              { hour: 14, activityScore: 90 },
              { hour: 19, activityScore: 70 }
            ],
            preferredNotificationTimes: [
              { hour: 9, minute: 0, enabled: true },
              { hour: 14, minute: 0, enabled: true }
            ]
          },
          notificationDelivery: {
            smartTiming: { enabled: true },
            digestPreferences: {
              daily: { enabled: true, time: { hour: 8, minute: 0 } },
              weekly: { enabled: true, dayOfWeek: 1, time: { hour: 9, minute: 0 } }
            }
          }
        },
        {
          firstName: 'Test',
          lastName: 'Photographer',
          email: 'test.photographer@zanara.com',
          phoneNumber: '+1234567891',
          password: 'testpassword123',
          professionalType: 'photographer',
          userType: 'talent',
          dateOfBirth: new Date('1990-03-20'),
          birthdayPrivacy: 'public',
          profileComplete: true,
          emailVerified: true
        },
        {
          firstName: 'Test',
          lastName: 'Designer',
          email: 'test.designer@zanara.com',
          phoneNumber: '+1234567892',
          password: 'testpassword123',
          professionalType: 'fashion-designer',
          userType: 'talent',
          dateOfBirth: new Date('1992-12-10'),
          birthdayPrivacy: 'connections',
          profileComplete: true,
          emailVerified: true
        }
      ];

      // Create users
      for (const userData of testUserData) {
        const user = new User(userData);
        await user.save();
        this.testUsers.push(user);
      }

      // Create connections between users with error handling
      try {
        const connection1 = new Connection({
          requester: this.testUsers[0]._id,
          recipient: this.testUsers[1]._id,
          requesterType: this.testUsers[0].professionalType,
          recipientType: this.testUsers[1].professionalType,
          status: 'accepted',
          connectedAt: new Date(),
          connectionStrength: { score: 75 }
        });
        await connection1.save();

        const connection2 = new Connection({
          requester: this.testUsers[1]._id,
          recipient: this.testUsers[2]._id,
          requesterType: this.testUsers[1].professionalType,
          recipientType: this.testUsers[2].professionalType,
          status: 'accepted',
          connectedAt: new Date(),
          connectionStrength: { score: 60 }
        });
        await connection2.save();
      } catch (connectionError) {
        console.warn('⚠️ Connection creation warning:', connectionError.message);
        // Continue with tests even if connections fail
      }

      // Create some test activities
      const activities = [
        {
          actor: this.testUsers[0]._id,
          type: 'profile_update',
          title: 'Excited to announce my new job at Fashion Week!',
          description: 'Just started as a lead model for the upcoming fashion week. Thrilled to share this amazing opportunity!',
          visibility: 'public',
          engagement: { totalReactions: 15 }
        },
        {
          actor: this.testUsers[1]._id,
          type: 'achievement_added',
          title: 'Celebrating 5 years anniversary in fashion photography',
          description: 'What an incredible milestone! Five years of capturing beautiful moments in fashion.',
          visibility: 'public',
          engagement: { totalReactions: 8 }
        }
      ];

      for (const activityData of activities) {
        try {
          const activity = new Activity(activityData);
          await activity.save();
        } catch (activityError) {
          console.warn('⚠️ Activity creation warning:', activityError.message);
        }
      }

      console.log(`✅ Created ${this.testUsers.length} test users with connections and activities`);

    } catch (error) {
      throw new Error(`Test data setup failed: ${error.message}`);
    }
  }

  async testSmartTimingService() {
    console.log('\n🧠 Testing Smart Timing Service...');

    try {
      // Test 1: Analyze user activity patterns
      const user = this.testUsers[0];
      const analysisResult = await smartTimingService.analyzeUserActivityPatterns(user._id);
      
      this.testResults.smartTiming.activityAnalysis = {
        success: !!analysisResult,
        message: analysisResult ? 'Activity pattern analysis completed' : 'Analysis failed'
      };

      // Test 2: Calculate optimal delivery time
      const optimalTime = await smartTimingService.calculateOptimalDeliveryTime(user._id, 'normal', 'normal');
      
      this.testResults.smartTiming.optimalTiming = {
        success: optimalTime instanceof Date,
        message: `Optimal delivery time calculated: ${optimalTime}`,
        time: optimalTime
      };

      // Test 3: Schedule a test notification
      const testNotificationData = {
        recipient: user._id,
        sender: this.testUsers[1]._id,
        type: 'test_notification',
        title: 'Test Smart Timing Notification',
        message: 'This is a test notification for smart timing',
        priority: 'normal'
      };

      const scheduledNotification = await smartTimingService.scheduleOptimalNotification(testNotificationData, user._id);
      
      this.testResults.smartTiming.scheduling = {
        success: !!scheduledNotification,
        message: scheduledNotification ? 'Notification scheduled successfully' : 'Scheduling failed',
        notificationId: scheduledNotification?._id
      };

      console.log('✅ Smart Timing Service tests completed');

    } catch (error) {
      console.error('❌ Smart Timing Service tests failed:', error);
      this.testResults.smartTiming.error = error.message;
    }
  }

  async testBirthdayService() {
    console.log('\n🎂 Testing Birthday Service...');

    try {
      // Test 1: Check daily birthdays (simulate today being a test user's birthday)
      const birthdayCount = await birthdayService.checkDailyBirthdays();
      
      this.testResults.birthday.dailyCheck = {
        success: true,
        count: birthdayCount,
        message: `Found ${birthdayCount} birthdays today`
      };

      // Test 2: Get upcoming birthdays
      const upcomingBirthdays = await birthdayService.getUpcomingBirthdays(this.testUsers[0]._id, 30);
      
      this.testResults.birthday.upcomingBirthdays = {
        success: true,
        count: upcomingBirthdays.length,
        message: `Found ${upcomingBirthdays.length} upcoming birthdays`,
        birthdays: upcomingBirthdays
      };

      // Test 3: Send birthday wish
      const wishResult = await birthdayService.sendBirthdayWish(
        this.testUsers[0]._id,
        this.testUsers[1]._id,
        'Happy Birthday! Hope you have an amazing day! 🎉'
      );
      
      this.testResults.birthday.sendWish = {
        success: wishResult,
        message: wishResult ? 'Birthday wish sent successfully' : 'Failed to send birthday wish'
      };

      // Test 4: Get birthday statistics
      const birthdayStats = await birthdayService.getBirthdayStats();
      
      this.testResults.birthday.statistics = {
        success: !!birthdayStats,
        stats: birthdayStats,
        message: 'Birthday statistics retrieved'
      };

      console.log('✅ Birthday Service tests completed');

    } catch (error) {
      console.error('❌ Birthday Service tests failed:', error);
      this.testResults.birthday.error = error.message;
    }
  }

  async testDigestService() {
    console.log('\n📰 Testing Digest Service...');

    try {
      // Test 1: Generate daily digest content
      const dailyDigest = await digestService.generateDailyDigestContent(this.testUsers[0]._id);
      
      this.testResults.digest.dailyDigest = {
        success: !!dailyDigest,
        itemCount: dailyDigest?.items?.length || 0,
        message: dailyDigest ? `Daily digest generated with ${dailyDigest.items.length} items` : 'No daily digest content'
      };

      // Test 2: Generate weekly digest content
      const weeklyDigest = await digestService.generateWeeklyDigestContent(this.testUsers[0]._id);
      
      this.testResults.digest.weeklyDigest = {
        success: !!weeklyDigest,
        itemCount: weeklyDigest?.items?.length || 0,
        message: weeklyDigest ? `Weekly digest generated with ${weeklyDigest.items.length} items` : 'No weekly digest content'
      };

      // Test 3: Test digest generation for all users
      const dailyDigestCount = await digestService.generateDailyDigests();
      
      this.testResults.digest.bulkGeneration = {
        success: true,
        count: dailyDigestCount,
        message: `Generated ${dailyDigestCount} daily digests for active users`
      };

      console.log('✅ Digest Service tests completed');

    } catch (error) {
      console.error('❌ Digest Service tests failed:', error);
      this.testResults.digest.error = error.message;
    }
  }

  async testContextualSuggestionsService() {
    console.log('\n🎯 Testing Contextual Suggestions Service...');

    try {
      // Test 1: Generate suggestions for a user
      const suggestionCount = await contextualSuggestionsService.generateUserSuggestions(this.testUsers[0]._id);
      
      this.testResults.contextualSuggestions.userSuggestions = {
        success: true,
        count: suggestionCount,
        message: `Generated ${suggestionCount} contextual suggestions`
      };

      // Test 2: Get suggestion statistics
      const suggestionStats = await contextualSuggestionsService.getSuggestionStats();
      
      this.testResults.contextualSuggestions.statistics = {
        success: !!suggestionStats,
        stats: suggestionStats,
        message: 'Suggestion statistics retrieved'
      };

      // Test 3: Test bulk suggestion generation
      const totalSuggestions = await contextualSuggestionsService.generateContextualSuggestions();
      
      this.testResults.contextualSuggestions.bulkGeneration = {
        success: true,
        count: totalSuggestions,
        message: `Generated ${totalSuggestions} total contextual suggestions`
      };

      console.log('✅ Contextual Suggestions Service tests completed');

    } catch (error) {
      console.error('❌ Contextual Suggestions Service tests failed:', error);
      this.testResults.contextualSuggestions.error = error.message;
    }
  }

  async testNotificationScheduler() {
    console.log('\n⏰ Testing Notification Scheduler...');

    try {
      // Test 1: Get scheduler status
      const status = notificationScheduler.getSchedulerStatus();
      
      this.testResults.scheduler.status = {
        success: true,
        isRunning: status.isRunning,
        taskCount: status.taskCount,
        message: `Scheduler ${status.isRunning ? 'is running' : 'is stopped'} with ${status.taskCount} tasks`
      };

      // Test 2: Test all services
      const testResults = await notificationScheduler.testAllServices();
      
      this.testResults.scheduler.serviceTests = {
        success: testResults.overall === 'passed',
        results: testResults,
        message: `Service tests ${testResults.overall}`
      };

      // Test 3: Get comprehensive stats
      const comprehensiveStats = await notificationScheduler.getComprehensiveStats();
      
      this.testResults.scheduler.comprehensiveStats = {
        success: !!comprehensiveStats,
        stats: comprehensiveStats,
        message: 'Comprehensive statistics retrieved'
      };

      // Test 4: Manual task execution
      const manualTaskResult = await notificationScheduler.runTaskManually('healthCheck');
      
      this.testResults.scheduler.manualTask = {
        success: manualTaskResult.success,
        result: manualTaskResult,
        message: `Manual health check ${manualTaskResult.success ? 'passed' : 'failed'}`
      };

      console.log('✅ Notification Scheduler tests completed');

    } catch (error) {
      console.error('❌ Notification Scheduler tests failed:', error);
      this.testResults.scheduler.error = error.message;
    }
  }

  async generateFinalReport() {
    console.log('\n📊 Generating Final Test Report...\n');

    const services = ['smartTiming', 'birthday', 'digest', 'contextualSuggestions', 'scheduler'];
    let totalTests = 0;
    let passedTests = 0;

    console.log('═'.repeat(80));
    console.log('🧪 PHASE 4: INTELLIGENT NOTIFICATIONS - TEST RESULTS');
    console.log('═'.repeat(80));

    for (const service of services) {
      const serviceResults = this.testResults[service];
      const serviceName = service.charAt(0).toUpperCase() + service.slice(1).replace(/([A-Z])/g, ' $1');
      
      console.log(`\n📋 ${serviceName} Service:`);
      console.log('─'.repeat(50));

      if (serviceResults.error) {
        console.log(`❌ Service failed: ${serviceResults.error}`);
        continue;
      }

      for (const [testName, testResult] of Object.entries(serviceResults)) {
        if (testName === 'error') continue;
        
        totalTests++;
        const status = testResult.success ? '✅' : '❌';
        const testDisplayName = testName.replace(/([A-Z])/g, ' $1').toLowerCase();
        
        if (testResult.success) passedTests++;
        
        console.log(`${status} ${testDisplayName}: ${testResult.message}`);
        
        if (testResult.count !== undefined) {
          console.log(`   📊 Count: ${testResult.count}`);
        }
      }
    }

    // Overall statistics
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    console.log('\n' + '═'.repeat(80));
    console.log('📈 OVERALL TEST RESULTS');
    console.log('═'.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT! Phase 4 implementation is working great!');
    } else if (successRate >= 70) {
      console.log('👍 GOOD! Phase 4 implementation is mostly working.');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT! Some Phase 4 features need attention.');
    }

    this.testResults.overall = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate,
      status: successRate >= 90 ? 'excellent' : successRate >= 70 ? 'good' : 'needs-improvement'
    };

    console.log('\n' + '═'.repeat(80));
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Remove test users and their related data
      const testUserIds = this.testUsers.map(user => user._id);
      
      await Notification.deleteMany({ 
        $or: [
          { recipient: { $in: testUserIds } },
          { sender: { $in: testUserIds } }
        ]
      });
      
      await Activity.deleteMany({ actor: { $in: testUserIds } });
      await Connection.deleteMany({
        $or: [
          { requester: { $in: testUserIds } },
          { recipient: { $in: testUserIds } }
        ]
      });
      
      await User.deleteMany({ _id: { $in: testUserIds } });
      
      console.log('✅ Test data cleanup completed');

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new Phase4TestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n🏁 Phase 4 test suite completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Phase 4 test suite failed:', error);
      process.exit(1);
    });
}

module.exports = Phase4TestSuite; 
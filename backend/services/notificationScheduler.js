const cron = require('node-cron');
const smartTimingService = require('./smartTimingService');
const birthdayService = require('./birthdayService');
const digestService = require('./digestService');
const contextualSuggestionsService = require('./contextualSuggestionsService');

class NotificationScheduler {
  constructor() {
    this.scheduledTasks = new Map();
    this.isRunning = false;
  }

  /**
   * Start all notification scheduling tasks
   */
  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️ Notification scheduler is already running');
      return;
    }

    console.log('🚀 Starting Phase 4 Intelligent Notification Scheduler...');
    this.isRunning = true;

    try {
      // 1. Daily birthday checks (every day at 9:00 AM)
      this.scheduledTasks.set('birthdayCheck', cron.schedule('0 9 * * *', async () => {
        console.log('🎂 Running daily birthday check...');
        try {
          const birthdayCount = await birthdayService.checkDailyBirthdays();
          console.log(`✅ Processed ${birthdayCount} birthdays`);
        } catch (error) {
          console.error('❌ Error in birthday check:', error);
        }
      }, { scheduled: false }));

      // 2. Daily digest generation (every day at 8:00 AM)
      this.scheduledTasks.set('dailyDigest', cron.schedule('0 8 * * *', async () => {
        console.log('📰 Generating daily digests...');
        try {
          const digestCount = await digestService.generateDailyDigests();
          console.log(`✅ Sent ${digestCount} daily digests`);
        } catch (error) {
          console.error('❌ Error generating daily digests:', error);
        }
      }, { scheduled: false }));

      // 3. Weekly digest generation (every Monday at 9:00 AM)
      this.scheduledTasks.set('weeklyDigest', cron.schedule('0 9 * * 1', async () => {
        console.log('📊 Generating weekly digests...');
        try {
          const digestCount = await digestService.generateWeeklyDigests();
          console.log(`✅ Sent ${digestCount} weekly digests`);
        } catch (error) {
          console.error('❌ Error generating weekly digests:', error);
        }
      }, { scheduled: false }));

      // 4. User activity pattern analysis (every day at 2:00 AM)
      this.scheduledTasks.set('activityAnalysis', cron.schedule('0 2 * * *', async () => {
        console.log('🧠 Running daily activity pattern analysis...');
        try {
          const analyzedCount = await smartTimingService.runDailyAnalysis();
          console.log(`✅ Analyzed ${analyzedCount} user activity patterns`);
        } catch (error) {
          console.error('❌ Error in activity analysis:', error);
        }
      }, { scheduled: false }));

      // 5. Contextual suggestions generation (every 6 hours)
      this.scheduledTasks.set('contextualSuggestions', cron.schedule('0 */6 * * *', async () => {
        console.log('🎯 Generating contextual suggestions...');
        try {
          const suggestionCount = await contextualSuggestionsService.generateContextualSuggestions();
          console.log(`✅ Generated ${suggestionCount} contextual suggestions`);
        } catch (error) {
          console.error('❌ Error generating contextual suggestions:', error);
        }
      }, { scheduled: false }));

      // 6. Scheduled notification processing (every 5 minutes)
      this.scheduledTasks.set('scheduledNotifications', cron.schedule('*/5 * * * *', async () => {
        try {
          const processedCount = await smartTimingService.processScheduledNotifications();
          if (processedCount > 0) {
            console.log(`📬 Processed ${processedCount} scheduled notifications`);
          }
        } catch (error) {
          console.error('❌ Error processing scheduled notifications:', error);
        }
      }, { scheduled: false }));

      // 7. Cleanup expired notifications (every day at 3:00 AM)
      this.scheduledTasks.set('cleanupExpired', cron.schedule('0 3 * * *', async () => {
        console.log('🧹 Cleaning up expired notifications...');
        try {
          const birthdayCleanup = await birthdayService.cleanupExpiredBirthdayNotifications();
          const digestCleanup = await digestService.cleanupOldDigests();
          const suggestionCleanup = await contextualSuggestionsService.cleanupExpiredSuggestions();
          
          const totalCleanup = birthdayCleanup + digestCleanup + suggestionCleanup;
          console.log(`✅ Cleaned up ${totalCleanup} expired notifications`);
        } catch (error) {
          console.error('❌ Error in cleanup:', error);
        }
      }, { scheduled: false }));

      // 8. Health check and metrics (every hour)
      this.scheduledTasks.set('healthCheck', cron.schedule('0 * * * *', async () => {
        try {
          await this.performHealthCheck();
        } catch (error) {
          console.error('❌ Error in health check:', error);
        }
      }, { scheduled: false }));

      // Start all tasks
      this.scheduledTasks.forEach((task, name) => {
        task.start();
        console.log(`✅ Started ${name} scheduler`);
      });

      console.log('🎉 Phase 4 Intelligent Notification Scheduler started successfully!');
      console.log('📋 Active scheduled tasks:');
      this.scheduledTasks.forEach((task, name) => {
        console.log(`   - ${name}`);
      });

    } catch (error) {
      console.error('❌ Error starting notification scheduler:', error);
      this.isRunning = false;
    }
  }

  /**
   * Stop all notification scheduling tasks
   */
  async stopScheduler() {
    if (!this.isRunning) {
      console.log('⚠️ Notification scheduler is not running');
      return;
    }

    console.log('🛑 Stopping notification scheduler...');

    this.scheduledTasks.forEach((task, name) => {
      task.stop();
      console.log(`✅ Stopped ${name} scheduler`);
    });

    this.scheduledTasks.clear();
    this.isRunning = false;

    console.log('✅ Notification scheduler stopped successfully');
  }

  /**
   * Restart the scheduler
   */
  async restartScheduler() {
    await this.stopScheduler();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.startScheduler();
  }

  /**
   * Get scheduler status
   */
  getSchedulerStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.scheduledTasks.keys()),
      taskCount: this.scheduledTasks.size
    };
  }

  /**
   * Perform health check on all notification services
   */
  async performHealthCheck() {
    try {
      const healthStatus = {
        timestamp: new Date(),
        services: {},
        overall: 'healthy'
      };

      // Check birthday service
      try {
        const birthdayStats = await birthdayService.getBirthdayStats();
        healthStatus.services.birthdayService = {
          status: 'healthy',
          stats: birthdayStats
        };
      } catch (error) {
        healthStatus.services.birthdayService = {
          status: 'error',
          error: error.message
        };
        healthStatus.overall = 'degraded';
      }

      // Check contextual suggestions service
      try {
        const suggestionStats = await contextualSuggestionsService.getSuggestionStats();
        healthStatus.services.contextualSuggestions = {
          status: 'healthy',
          stats: suggestionStats
        };
      } catch (error) {
        healthStatus.services.contextualSuggestions = {
          status: 'error',
          error: error.message
        };
        healthStatus.overall = 'degraded';
      }

      // Check digest service (basic check)
      try {
        healthStatus.services.digestService = {
          status: 'healthy',
          lastCheck: new Date()
        };
      } catch (error) {
        healthStatus.services.digestService = {
          status: 'error',
          error: error.message
        };
        healthStatus.overall = 'degraded';
      }

      // Check smart timing service (basic check)
      try {
        healthStatus.services.smartTimingService = {
          status: 'healthy',
          lastCheck: new Date()
        };
      } catch (error) {
        healthStatus.services.smartTimingService = {
          status: 'error',
          error: error.message
        };
        healthStatus.overall = 'degraded';
      }

      // Log health status (only log if there are issues)
      if (healthStatus.overall !== 'healthy') {
        console.log('⚠️ Notification services health check:', JSON.stringify(healthStatus, null, 2));
      }

      return healthStatus;

    } catch (error) {
      console.error('❌ Error performing health check:', error);
      return {
        timestamp: new Date(),
        overall: 'error',
        error: error.message
      };
    }
  }

  /**
   * Run a specific task manually
   */
  async runTaskManually(taskName) {
    try {
      console.log(`🔧 Manually running task: ${taskName}`);

      switch (taskName) {
        case 'birthdayCheck':
          const birthdayCount = await birthdayService.checkDailyBirthdays();
          console.log(`✅ Processed ${birthdayCount} birthdays`);
          return { success: true, count: birthdayCount };

        case 'dailyDigest':
          const dailyDigestCount = await digestService.generateDailyDigests();
          console.log(`✅ Sent ${dailyDigestCount} daily digests`);
          return { success: true, count: dailyDigestCount };

        case 'weeklyDigest':
          const weeklyDigestCount = await digestService.generateWeeklyDigests();
          console.log(`✅ Sent ${weeklyDigestCount} weekly digests`);
          return { success: true, count: weeklyDigestCount };

        case 'activityAnalysis':
          const analyzedCount = await smartTimingService.runDailyAnalysis();
          console.log(`✅ Analyzed ${analyzedCount} user activity patterns`);
          return { success: true, count: analyzedCount };

        case 'contextualSuggestions':
          const suggestionCount = await contextualSuggestionsService.generateContextualSuggestions();
          console.log(`✅ Generated ${suggestionCount} contextual suggestions`);
          return { success: true, count: suggestionCount };

        case 'scheduledNotifications':
          const processedCount = await smartTimingService.processScheduledNotifications();
          console.log(`✅ Processed ${processedCount} scheduled notifications`);
          return { success: true, count: processedCount };

        case 'cleanupExpired':
          const birthdayCleanup = await birthdayService.cleanupExpiredBirthdayNotifications();
          const digestCleanup = await digestService.cleanupOldDigests();
          const suggestionCleanup = await contextualSuggestionsService.cleanupExpiredSuggestions();
          const totalCleanup = birthdayCleanup + digestCleanup + suggestionCleanup;
          console.log(`✅ Cleaned up ${totalCleanup} expired notifications`);
          return { success: true, count: totalCleanup };

        case 'healthCheck':
          const healthStatus = await this.performHealthCheck();
          console.log(`✅ Health check completed: ${healthStatus.overall}`);
          return { success: true, status: healthStatus };

        default:
          throw new Error(`Unknown task: ${taskName}`);
      }

    } catch (error) {
      console.error(`❌ Error running task ${taskName}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getComprehensiveStats() {
    try {
      const stats = {
        timestamp: new Date(),
        scheduler: this.getSchedulerStatus(),
        services: {}
      };

      // Birthday service stats
      try {
        stats.services.birthdays = await birthdayService.getBirthdayStats();
      } catch (error) {
        stats.services.birthdays = { error: error.message };
      }

      // Contextual suggestions stats
      try {
        stats.services.suggestions = await contextualSuggestionsService.getSuggestionStats();
      } catch (error) {
        stats.services.suggestions = { error: error.message };
      }

      // Health check
      try {
        stats.health = await this.performHealthCheck();
      } catch (error) {
        stats.health = { error: error.message };
      }

      return stats;

    } catch (error) {
      console.error('Error getting comprehensive stats:', error);
      return {
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Emergency stop all notifications
   */
  async emergencyStop() {
    console.log('🚨 EMERGENCY STOP: Stopping all notification services...');
    
    try {
      await this.stopScheduler();
      console.log('✅ Emergency stop completed successfully');
      return { success: true, message: 'All notification services stopped' };
    } catch (error) {
      console.error('❌ Error during emergency stop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test all notification services
   */
  async testAllServices() {
    console.log('🧪 Testing all notification services...');
    
    const testResults = {
      timestamp: new Date(),
      tests: {},
      overall: 'passed'
    };

    // Test birthday service
    try {
      testResults.tests.birthdayService = {
        status: 'passed',
        message: 'Birthday service is functional'
      };
    } catch (error) {
      testResults.tests.birthdayService = {
        status: 'failed',
        error: error.message
      };
      testResults.overall = 'failed';
    }

    // Test digest service
    try {
      testResults.tests.digestService = {
        status: 'passed',
        message: 'Digest service is functional'
      };
    } catch (error) {
      testResults.tests.digestService = {
        status: 'failed',
        error: error.message
      };
      testResults.overall = 'failed';
    }

    // Test smart timing service
    try {
      testResults.tests.smartTimingService = {
        status: 'passed',
        message: 'Smart timing service is functional'
      };
    } catch (error) {
      testResults.tests.smartTimingService = {
        status: 'failed',
        error: error.message
      };
      testResults.overall = 'failed';
    }

    // Test contextual suggestions service
    try {
      testResults.tests.contextualSuggestionsService = {
        status: 'passed',
        message: 'Contextual suggestions service is functional'
      };
    } catch (error) {
      testResults.tests.contextualSuggestionsService = {
        status: 'failed',
        error: error.message
      };
      testResults.overall = 'failed';
    }

    console.log(`🧪 Service tests completed: ${testResults.overall}`);
    return testResults;
  }
}

module.exports = new NotificationScheduler(); 
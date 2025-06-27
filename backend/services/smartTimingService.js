const User = require('../models/User');
const Notification = require('../models/Notification');
const moment = require('moment-timezone');

class SmartTimingService {
  constructor() {
    this.analysisInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.activityThreshold = 5; // minimum activities to consider pattern
  }

  /**
   * Analyze user activity patterns and update preferences
   */
  async analyzeUserActivityPatterns(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      console.log(`🧠 Analyzing activity patterns for user: ${user.fullName}`);

      // Get user's recent activities (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Analyze login patterns, content interactions, etc.
      const activityData = await this.getUserActivityData(userId, thirtyDaysAgo);
      
      if (activityData.length < this.activityThreshold) {
        console.log(`⚠️ Insufficient activity data for ${user.fullName}`);
        return user;
      }

      // Analyze hourly patterns
      const hourlyPatterns = this.analyzeHourlyPatterns(activityData, user.activityPatterns?.timezone || 'UTC');
      
      // Analyze daily patterns
      const dailyPatterns = this.analyzeDailyPatterns(activityData);
      
      // Update user's activity patterns
      await this.updateUserActivityPatterns(userId, hourlyPatterns, dailyPatterns);
      
      console.log(`✅ Updated activity patterns for ${user.fullName}`);
      return await User.findById(userId);

    } catch (error) {
      console.error('Error analyzing user activity patterns:', error);
      return null;
    }
  }

  /**
   * Get user activity data from various sources
   */
  async getUserActivityData(userId, since) {
    const activities = [];

    try {
      // Get login activities (from user's lastActiveAt updates)
      const user = await User.findById(userId);
      if (user.lastActiveAt && user.lastActiveAt >= since) {
        activities.push({
          type: 'login',
          timestamp: user.lastActiveAt,
          score: 5
        });
      }

      // Get notification interactions
      const notifications = await Notification.find({
        recipient: userId,
        readAt: { $gte: since, $exists: true }
      }).select('readAt createdAt type');

      notifications.forEach(notif => {
        if (notif.readAt) {
          activities.push({
            type: 'notification_read',
            timestamp: notif.readAt,
            score: 3,
            responseTime: notif.readAt - notif.createdAt
          });
        }
      });

      // Get content creation activities
      const Activity = require('../models/Activity');
      const userActivities = await Activity.find({
        actor: userId,
        createdAt: { $gte: since }
      }).select('createdAt type');

      userActivities.forEach(activity => {
        activities.push({
          type: 'content_creation',
          timestamp: activity.createdAt,
          score: 8
        });
      });

      return activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    } catch (error) {
      console.error('Error getting user activity data:', error);
      return [];
    }
  }

  /**
   * Analyze hourly activity patterns
   */
  analyzeHourlyPatterns(activities, timezone) {
    const hourlyScores = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    activities.forEach(activity => {
      const localTime = moment(activity.timestamp).tz(timezone);
      const hour = localTime.hour();
      
      hourlyScores[hour] += activity.score || 1;
      hourlyCounts[hour]++;
    });

    // Normalize scores
    const maxScore = Math.max(...hourlyScores);
    const patterns = [];

    for (let hour = 0; hour < 24; hour++) {
      if (hourlyCounts[hour] > 0) {
        patterns.push({
          hour,
          activityScore: maxScore > 0 ? Math.round((hourlyScores[hour] / maxScore) * 100) : 0,
          lastUpdated: new Date()
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze daily activity patterns
   */
  analyzeDailyPatterns(activities) {
    const dailyScores = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);

    activities.forEach(activity => {
      const dayOfWeek = new Date(activity.timestamp).getDay();
      
      dailyScores[dayOfWeek] += activity.score || 1;
      dailyCounts[dayOfWeek]++;
    });

    // Normalize scores
    const maxScore = Math.max(...dailyScores);
    const patterns = [];

    for (let day = 0; day < 7; day++) {
      if (dailyCounts[day] > 0) {
        patterns.push({
          dayOfWeek: day,
          activityScore: maxScore > 0 ? Math.round((dailyScores[day] / maxScore) * 100) : 0,
          lastUpdated: new Date()
        });
      }
    }

    return patterns;
  }

  /**
   * Update user's activity patterns in database
   */
  async updateUserActivityPatterns(userId, hourlyPatterns, dailyPatterns) {
    try {
      const user = await User.findById(userId);
      
      if (!user.activityPatterns) {
        user.activityPatterns = {
          activeHours: [],
          activeDays: [],
          timezone: 'UTC',
          preferredNotificationTimes: [],
          lastAnalyzed: new Date(),
          engagementHistory: {
            preferredHours: [],
            preferredContentLength: 500,
            preferredHashtags: [],
            avgSessionDuration: 0,
            totalSessions: 0
          }
        };
      }

      // Update hourly patterns
      user.activityPatterns.activeHours = hourlyPatterns;
      user.activityPatterns.activeDays = dailyPatterns;
      user.activityPatterns.lastAnalyzed = new Date();

      // Generate preferred notification times based on high activity hours
      const topHours = hourlyPatterns
        .filter(h => h.activityScore > 70)
        .sort((a, b) => b.activityScore - a.activityScore)
        .slice(0, 3);

      user.activityPatterns.preferredNotificationTimes = topHours.map(h => ({
        hour: h.hour,
        minute: 0,
        enabled: true
      }));

      // Update engagement history
      user.activityPatterns.engagementHistory.preferredHours = topHours.map(h => h.hour);
      user.activityPatterns.engagementHistory.totalSessions += 1;

      await user.save();
      return user;

    } catch (error) {
      console.error('Error updating user activity patterns:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal delivery time for a notification
   */
  async calculateOptimalDeliveryTime(userId, notificationType = 'normal', priority = 'normal') {
    try {
      const user = await User.findById(userId);
      if (!user) return new Date();

      const now = new Date();
      const userTimezone = user.activityPatterns?.timezone || 'UTC';
      const currentUserTime = moment().tz(userTimezone);

      // High priority notifications send immediately
      if (priority === 'urgent' || priority === 'high') {
        return now;
      }

      // Check if smart timing is enabled
      if (!user.notificationDelivery?.smartTiming?.enabled) {
        return now;
      }

      // Check quiet hours
      if (user.notificationDelivery?.smartTiming?.respectQuietHours) {
        const quietStart = user.notificationDelivery.smartTiming.quietHoursStart || 22;
        const quietEnd = user.notificationDelivery.smartTiming.quietHoursEnd || 8;
        const currentHour = currentUserTime.hour();

        if (this.isQuietHour(currentHour, quietStart, quietEnd)) {
          // Schedule for next optimal time after quiet hours
          const nextOptimalTime = await this.getNextOptimalTime(user, userTimezone);
          console.log(`📅 Scheduling notification for ${user.fullName} at optimal time: ${nextOptimalTime}`);
          return nextOptimalTime;
        }
      }

      // Check if current time is optimal based on user patterns
      const isOptimalNow = await this.isOptimalTime(user, currentUserTime);
      
      if (isOptimalNow) {
        return now;
      } else {
        // Find next optimal time
        const nextOptimalTime = await this.getNextOptimalTime(user, userTimezone);
        console.log(`⏰ Delaying notification for ${user.fullName} until optimal time: ${nextOptimalTime}`);
        return nextOptimalTime;
      }

    } catch (error) {
      console.error('Error calculating optimal delivery time:', error);
      return new Date(); // Fallback to immediate delivery
    }
  }

  /**
   * Check if current time is during quiet hours
   */
  isQuietHour(currentHour, quietStart, quietEnd) {
    if (quietStart < quietEnd) {
      // Same day quiet hours (e.g., 22:00 - 08:00 next day)
      return currentHour >= quietStart || currentHour < quietEnd;
    } else {
      // Quiet hours span midnight (e.g., 23:00 - 07:00)
      return currentHour >= quietStart && currentHour < quietEnd;
    }
  }

  /**
   * Check if current time is optimal for user
   */
  async isOptimalTime(user, currentTime) {
    const currentHour = currentTime.hour();
    const currentDay = currentTime.day();

    // Check preferred notification times
    const preferredTimes = user.activityPatterns?.preferredNotificationTimes || [];
    const hasPreferredTime = preferredTimes.some(time => 
      time.enabled && Math.abs(time.hour - currentHour) <= 1
    );

    if (hasPreferredTime) return true;

    // Check activity patterns
    const activeHours = user.activityPatterns?.activeHours || [];
    const activeDays = user.activityPatterns?.activeDays || [];

    const currentHourPattern = activeHours.find(h => h.hour === currentHour);
    const currentDayPattern = activeDays.find(d => d.dayOfWeek === currentDay);

    const hourScore = currentHourPattern?.activityScore || 0;
    const dayScore = currentDayPattern?.activityScore || 0;

    // Consider it optimal if both hour and day scores are above threshold
    return hourScore > 50 && dayScore > 30;
  }

  /**
   * Get next optimal time for notification delivery
   */
  async getNextOptimalTime(user, timezone) {
    const now = moment().tz(timezone);
    let nextTime = now.clone();

    // Get user's preferred times
    const preferredTimes = user.activityPatterns?.preferredNotificationTimes || [];
    
    if (preferredTimes.length > 0) {
      // Find next preferred time
      const sortedTimes = preferredTimes
        .filter(t => t.enabled)
        .sort((a, b) => a.hour - b.hour);

      for (const time of sortedTimes) {
        const candidateTime = now.clone()
          .hour(time.hour)
          .minute(time.minute || 0)
          .second(0);

        if (candidateTime.isAfter(now)) {
          return candidateTime.toDate();
        }
      }

      // If no time today, use first preferred time tomorrow
      if (sortedTimes.length > 0) {
        return now.clone()
          .add(1, 'day')
          .hour(sortedTimes[0].hour)
          .minute(sortedTimes[0].minute || 0)
          .second(0)
          .toDate();
      }
    }

    // Fallback: use most active hour patterns
    const activeHours = user.activityPatterns?.activeHours || [];
    const topHour = activeHours
      .sort((a, b) => b.activityScore - a.activityScore)[0];

    if (topHour) {
      const candidateTime = now.clone()
        .hour(topHour.hour)
        .minute(0)
        .second(0);

      if (candidateTime.isAfter(now)) {
        return candidateTime.toDate();
      } else {
        return candidateTime.add(1, 'day').toDate();
      }
    }

    // Ultimate fallback: 9 AM next day
    return now.clone()
      .add(1, 'day')
      .hour(9)
      .minute(0)
      .second(0)
      .toDate();
  }

  /**
   * Schedule notification for optimal delivery
   */
  async scheduleOptimalNotification(notificationData, userId) {
    try {
      const optimalTime = await this.calculateOptimalDeliveryTime(
        userId, 
        notificationData.type, 
        notificationData.priority
      );

      const now = new Date();
      const delayMs = optimalTime.getTime() - now.getTime();

      if (delayMs <= 0) {
        // Send immediately
        return await Notification.createOrBatchNotification(notificationData);
      } else {
        // Schedule for later
        console.log(`⏰ Scheduling notification for ${delayMs}ms delay`);
        
        // Store scheduled notification
        const scheduledNotification = await Notification.create({
          ...notificationData,
          status: 'scheduled',
          scheduledFor: optimalTime,
          createdAt: now
        });

        // Set timeout for delivery (for short delays)
        if (delayMs < 60 * 60 * 1000) { // Less than 1 hour
          setTimeout(async () => {
            try {
              await this.deliverScheduledNotification(scheduledNotification._id);
            } catch (error) {
              console.error('Error delivering scheduled notification:', error);
            }
          }, delayMs);
        }

        return scheduledNotification;
      }

    } catch (error) {
      console.error('Error scheduling optimal notification:', error);
      // Fallback to immediate delivery
      return await Notification.createOrBatchNotification(notificationData);
    }
  }

  /**
   * Deliver a scheduled notification
   */
  async deliverScheduledNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification || notification.status !== 'scheduled') {
        return null;
      }

      // Update status and deliver
      notification.status = 'unread';
      notification.deliveredAt = new Date();
      await notification.save();

      console.log(`📬 Delivered scheduled notification: ${notification.title}`);
      return notification;

    } catch (error) {
      console.error('Error delivering scheduled notification:', error);
      return null;
    }
  }

  /**
   * Process all scheduled notifications that are due
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const dueNotifications = await Notification.find({
        status: 'scheduled',
        scheduledFor: { $lte: now }
      });

      console.log(`📬 Processing ${dueNotifications.length} scheduled notifications`);

      for (const notification of dueNotifications) {
        await this.deliverScheduledNotification(notification._id);
      }

      return dueNotifications.length;

    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      return 0;
    }
  }

  /**
   * Run daily analysis for all active users
   */
  async runDailyAnalysis() {
    try {
      console.log('🧠 Starting daily activity pattern analysis...');

      const activeUsers = await User.find({
        lastActiveAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
        }
      }).select('_id fullName activityPatterns.lastAnalyzed');

      let analyzedCount = 0;

      for (const user of activeUsers) {
        const lastAnalyzed = user.activityPatterns?.lastAnalyzed;
        const shouldAnalyze = !lastAnalyzed || 
          (Date.now() - lastAnalyzed.getTime()) > this.analysisInterval;

        if (shouldAnalyze) {
          await this.analyzeUserActivityPatterns(user._id);
          analyzedCount++;
          
          // Add delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ Daily analysis complete. Analyzed ${analyzedCount} users.`);
      return analyzedCount;

    } catch (error) {
      console.error('Error running daily analysis:', error);
      return 0;
    }
  }
}

module.exports = new SmartTimingService(); 
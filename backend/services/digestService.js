const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Connection = require('../models/Connection');
const smartTimingService = require('./smartTimingService');
const moment = require('moment-timezone');

class DigestService {
  constructor() {
    this.digestTypes = ['daily', 'weekly', 'monthly'];
    this.maxDigestItems = {
      daily: 10,
      weekly: 20,
      monthly: 30
    };
  }

  /**
   * Generate and send daily digests
   */
  async generateDailyDigests() {
    try {
      console.log('📰 Generating daily digests...');

      const users = await User.find({
        'notificationDelivery.digestPreferences.daily.enabled': true,
        lastActiveAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
        }
      }).select('_id firstName lastName notificationDelivery activityPatterns');

      let digestsSent = 0;

      for (const user of users) {
        try {
          const digestContent = await this.generateDailyDigestContent(user._id);
          
          if (digestContent && digestContent.items.length > 0) {
            await this.sendDigestNotification(user, digestContent, 'daily');
            digestsSent++;
          }

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error generating daily digest for ${user.firstName}:`, error);
        }
      }

      console.log(`✅ Sent ${digestsSent} daily digests`);
      return digestsSent;

    } catch (error) {
      console.error('Error generating daily digests:', error);
      return 0;
    }
  }

  /**
   * Generate and send weekly digests
   */
  async generateWeeklyDigests() {
    try {
      console.log('📊 Generating weekly digests...');

      const users = await User.find({
        'notificationDelivery.digestPreferences.weekly.enabled': true,
        lastActiveAt: { 
          $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Active in last 14 days
        }
      }).select('_id firstName lastName notificationDelivery activityPatterns');

      let digestsSent = 0;

      for (const user of users) {
        try {
          const digestContent = await this.generateWeeklyDigestContent(user._id);
          
          if (digestContent && digestContent.items.length > 0) {
            await this.sendDigestNotification(user, digestContent, 'weekly');
            digestsSent++;
          }

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 150));

        } catch (error) {
          console.error(`Error generating weekly digest for ${user.firstName}:`, error);
        }
      }

      console.log(`✅ Sent ${digestsSent} weekly digests`);
      return digestsSent;

    } catch (error) {
      console.error('Error generating weekly digests:', error);
      return 0;
    }
  }

  /**
   * Generate daily digest content for a user
   */
  async generateDailyDigestContent(userId) {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const today = new Date();

      const digestContent = {
        type: 'daily',
        period: 'Yesterday',
        date: yesterday,
        items: [],
        stats: {
          totalActivities: 0,
          newConnections: 0,
          profileViews: 0,
          contentEngagement: 0
        }
      };

      // Get user's connections for relevant content
      const userConnections = await this.getUserConnections(userId);

      // 1. New connection requests and acceptances
      const connectionActivity = await this.getConnectionActivity(userId, yesterday, today);
      if (connectionActivity.length > 0) {
        digestContent.items.push({
          type: 'connections',
          title: `${connectionActivity.length} Connection Update${connectionActivity.length > 1 ? 's' : ''}`,
          items: connectionActivity.slice(0, 5),
          priority: 'high'
        });
        digestContent.stats.newConnections = connectionActivity.length;
      }

      // 2. Profile views and interactions
      const profileActivity = await this.getProfileActivity(userId, yesterday, today);
      if (profileActivity.views > 0) {
        digestContent.items.push({
          type: 'profile_activity',
          title: `${profileActivity.views} Profile View${profileActivity.views > 1 ? 's' : ''}`,
          description: `Your profile was viewed ${profileActivity.views} time${profileActivity.views > 1 ? 's' : ''} yesterday`,
          priority: 'medium'
        });
        digestContent.stats.profileViews = profileActivity.views;
      }

      // 3. Content from network
      const networkContent = await this.getNetworkContent(userId, userConnections, yesterday, today);
      if (networkContent.length > 0) {
        digestContent.items.push({
          type: 'network_activity',
          title: `${networkContent.length} Update${networkContent.length > 1 ? 's' : ''} from Your Network`,
          items: networkContent.slice(0, 5),
          priority: 'medium'
        });
      }

      // 4. Missed notifications summary
      const missedNotifications = await this.getMissedNotifications(userId, yesterday, today);
      if (missedNotifications.length > 0) {
        digestContent.items.push({
          type: 'missed_notifications',
          title: `${missedNotifications.length} Notification${missedNotifications.length > 1 ? 's' : ''} You Missed`,
          items: missedNotifications.slice(0, 3),
          priority: 'low'
        });
      }

      // 5. Trending content in user's field
      const trendingContent = await this.getTrendingContent(userId, yesterday, today);
      if (trendingContent.length > 0) {
        digestContent.items.push({
          type: 'trending',
          title: `Trending in ${await this.getUserProfessionalField(userId)}`,
          items: trendingContent.slice(0, 3),
          priority: 'low'
        });
      }

      digestContent.stats.totalActivities = digestContent.items.reduce((sum, item) => 
        sum + (item.items ? item.items.length : 1), 0
      );

      return digestContent.items.length > 0 ? digestContent : null;

    } catch (error) {
      console.error('Error generating daily digest content:', error);
      return null;
    }
  }

  /**
   * Generate weekly digest content for a user
   */
  async generateWeeklyDigestContent(userId) {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date();

      const digestContent = {
        type: 'weekly',
        period: 'This Week',
        date: oneWeekAgo,
        items: [],
        stats: {
          totalActivities: 0,
          newConnections: 0,
          profileViews: 0,
          contentEngagement: 0,
          networkGrowth: 0
        }
      };

      // Get user's connections
      const userConnections = await this.getUserConnections(userId);

      // 1. Weekly connection summary
      const weeklyConnections = await this.getConnectionActivity(userId, oneWeekAgo, today);
      if (weeklyConnections.length > 0) {
        digestContent.items.push({
          type: 'weekly_connections',
          title: `${weeklyConnections.length} New Connection${weeklyConnections.length > 1 ? 's' : ''} This Week`,
          items: weeklyConnections,
          priority: 'high'
        });
        digestContent.stats.newConnections = weeklyConnections.length;
      }

      // 2. Profile performance
      const weeklyProfileStats = await this.getWeeklyProfileStats(userId, oneWeekAgo, today);
      if (weeklyProfileStats.totalViews > 0) {
        digestContent.items.push({
          type: 'profile_performance',
          title: 'Your Profile Performance',
          description: `${weeklyProfileStats.totalViews} views • ${weeklyProfileStats.uniqueViewers} unique viewers`,
          stats: weeklyProfileStats,
          priority: 'high'
        });
        digestContent.stats.profileViews = weeklyProfileStats.totalViews;
      }

      // 3. Network highlights
      const networkHighlights = await this.getNetworkHighlights(userId, userConnections, oneWeekAgo, today);
      if (networkHighlights.length > 0) {
        digestContent.items.push({
          type: 'network_highlights',
          title: 'Highlights from Your Network',
          items: networkHighlights.slice(0, 8),
          priority: 'medium'
        });
      }

      // 4. Content engagement summary
      const contentEngagement = await this.getContentEngagementSummary(userId, oneWeekAgo, today);
      if (contentEngagement.totalEngagement > 0) {
        digestContent.items.push({
          type: 'content_engagement',
          title: 'Your Content Performance',
          stats: contentEngagement,
          priority: 'medium'
        });
        digestContent.stats.contentEngagement = contentEngagement.totalEngagement;
      }

      // 5. Industry insights
      const industryInsights = await this.getIndustryInsights(userId, oneWeekAgo, today);
      if (industryInsights.length > 0) {
        digestContent.items.push({
          type: 'industry_insights',
          title: 'Fashion Industry Insights',
          items: industryInsights.slice(0, 5),
          priority: 'low'
        });
      }

      // 6. Suggested actions
      const suggestedActions = await this.getSuggestedActions(userId);
      if (suggestedActions.length > 0) {
        digestContent.items.push({
          type: 'suggested_actions',
          title: 'Suggested Actions',
          items: suggestedActions.slice(0, 3),
          priority: 'medium'
        });
      }

      digestContent.stats.totalActivities = digestContent.items.reduce((sum, item) => 
        sum + (item.items ? item.items.length : 1), 0
      );

      return digestContent.items.length > 0 ? digestContent : null;

    } catch (error) {
      console.error('Error generating weekly digest content:', error);
      return null;
    }
  }

  /**
   * Send digest notification to user
   */
  async sendDigestNotification(user, digestContent, digestType) {
    try {
      const title = this.generateDigestTitle(digestContent, digestType);
      const message = this.generateDigestMessage(digestContent, digestType);

      const notificationData = {
        recipient: user._id,
        sender: user._id, // System notification
        type: `${digestType}_digest`,
        title: title,
        message: message,
        metadata: {
          digestType: digestType,
          digestContent: digestContent,
          itemCount: digestContent.items.length,
          stats: digestContent.stats,
          isSystemMessage: true
        },
        priority: 'normal',
        actionUrl: '/notifications?filter=digest'
      };

      // Use smart timing for digest delivery
      await smartTimingService.scheduleOptimalNotification(notificationData, user._id);

      console.log(`📰 Sent ${digestType} digest to ${user.firstName}`);
      return true;

    } catch (error) {
      console.error(`Error sending ${digestType} digest:`, error);
      return false;
    }
  }

  /**
   * Generate digest title
   */
  generateDigestTitle(digestContent, digestType) {
    const typeEmojis = {
      daily: '📰',
      weekly: '📊',
      monthly: '📈'
    };

    const emoji = typeEmojis[digestType] || '📋';
    const period = digestType.charAt(0).toUpperCase() + digestType.slice(1);
    
    return `${emoji} Your ${period} Digest`;
  }

  /**
   * Generate digest message
   */
  generateDigestMessage(digestContent, digestType) {
    const stats = digestContent.stats;
    const items = digestContent.items;

    if (digestType === 'daily') {
      return `Yesterday's highlights: ${stats.newConnections} new connections, ${stats.profileViews} profile views, and ${items.length} updates from your network.`;
    } else if (digestType === 'weekly') {
      return `This week: ${stats.newConnections} new connections, ${stats.profileViews} profile views, ${stats.contentEngagement} content interactions, and ${items.length} key highlights.`;
    } else {
      return `Monthly summary: ${stats.totalActivities} activities, ${stats.newConnections} connections, and key insights from your network.`;
    }
  }

  /**
   * Get user's connections
   */
  async getUserConnections(userId) {
    try {
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      });

      return connections.map(conn => 
        conn.requester.toString() === userId.toString() ? conn.recipient : conn.requester
      );

    } catch (error) {
      console.error('Error getting user connections:', error);
      return [];
    }
  }

  /**
   * Get connection activity for a time period
   */
  async getConnectionActivity(userId, startDate, endDate) {
    try {
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted', connectedAt: { $gte: startDate, $lt: endDate } },
          { recipient: userId, status: 'accepted', connectedAt: { $gte: startDate, $lt: endDate } }
        ]
      }).populate('requester recipient', 'firstName lastName professionalType profilePicture');

      return connections.map(conn => {
        const otherUser = conn.requester._id.toString() === userId.toString() 
          ? conn.recipient 
          : conn.requester;

        return {
          type: 'new_connection',
          user: otherUser,
          timestamp: conn.connectedAt,
          connectionStrength: conn.connectionStrength?.score || 0
        };
      });

    } catch (error) {
      console.error('Error getting connection activity:', error);
      return [];
    }
  }

  /**
   * Get profile activity for a time period
   */
  async getProfileActivity(userId, startDate, endDate) {
    try {
      // Count profile view notifications
      const profileViews = await Notification.countDocuments({
        recipient: userId,
        type: 'profile_view',
        createdAt: { $gte: startDate, $lt: endDate }
      });

      return {
        views: profileViews,
        period: 'yesterday'
      };

    } catch (error) {
      console.error('Error getting profile activity:', error);
      return { views: 0 };
    }
  }

  /**
   * Get network content for a time period
   */
  async getNetworkContent(userId, userConnections, startDate, endDate) {
    try {
      const networkActivities = await Activity.find({
        actor: { $in: userConnections },
        createdAt: { $gte: startDate, $lt: endDate },
        visibility: { $in: ['public', 'connections'] }
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

      return networkActivities.map(activity => ({
        type: 'network_activity',
        activity: activity,
        user: activity.actor,
        timestamp: activity.createdAt
      }));

    } catch (error) {
      console.error('Error getting network content:', error);
      return [];
    }
  }

  /**
   * Get missed notifications
   */
  async getMissedNotifications(userId, startDate, endDate) {
    try {
      const missedNotifications = await Notification.find({
        recipient: userId,
        status: 'unread',
        createdAt: { $gte: startDate, $lt: endDate },
        type: { $nin: ['daily_digest', 'weekly_digest', 'monthly_digest'] }
      })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);

      return missedNotifications.map(notif => ({
        type: 'missed_notification',
        notification: notif,
        timestamp: notif.createdAt
      }));

    } catch (error) {
      console.error('Error getting missed notifications:', error);
      return [];
    }
  }

  /**
   * Get trending content
   */
  async getTrendingContent(userId, startDate, endDate) {
    try {
      const user = await User.findById(userId);
      const professionalType = user.professionalType;

      // Get activities with high engagement from users of same professional type
      const trendingActivities = await Activity.find({
        createdAt: { $gte: startDate, $lt: endDate },
        'engagement.totalReactions': { $gte: 5 },
        visibility: 'public'
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ 'engagement.totalReactions': -1 })
      .limit(5);

      return trendingActivities
        .filter(activity => activity.actor.professionalType === professionalType)
        .map(activity => ({
          type: 'trending_content',
          activity: activity,
          user: activity.actor,
          engagement: activity.engagement.totalReactions
        }));

    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  /**
   * Get weekly profile stats
   */
  async getWeeklyProfileStats(userId, startDate, endDate) {
    try {
      const profileViewNotifications = await Notification.find({
        recipient: userId,
        type: 'profile_view',
        createdAt: { $gte: startDate, $lt: endDate }
      }).populate('sender', 'firstName lastName');

      const uniqueViewers = new Set(profileViewNotifications.map(n => n.sender._id.toString())).size;

      return {
        totalViews: profileViewNotifications.length,
        uniqueViewers: uniqueViewers,
        dailyAverage: Math.round(profileViewNotifications.length / 7)
      };

    } catch (error) {
      console.error('Error getting weekly profile stats:', error);
      return { totalViews: 0, uniqueViewers: 0, dailyAverage: 0 };
    }
  }

  /**
   * Get network highlights
   */
  async getNetworkHighlights(userId, userConnections, startDate, endDate) {
    try {
      // Get high-engagement activities from network
      const highlights = await Activity.find({
        actor: { $in: userConnections },
        createdAt: { $gte: startDate, $lt: endDate },
        'engagement.totalReactions': { $gte: 3 }
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ 'engagement.totalReactions': -1 })
      .limit(8);

      return highlights.map(activity => ({
        type: 'network_highlight',
        activity: activity,
        user: activity.actor,
        engagement: activity.engagement.totalReactions
      }));

    } catch (error) {
      console.error('Error getting network highlights:', error);
      return [];
    }
  }

  /**
   * Get content engagement summary
   */
  async getContentEngagementSummary(userId, startDate, endDate) {
    try {
      const userActivities = await Activity.find({
        actor: userId,
        createdAt: { $gte: startDate, $lt: endDate }
      });

      const totalEngagement = userActivities.reduce((sum, activity) => 
        sum + (activity.engagement?.totalReactions || 0), 0
      );

      const totalPosts = userActivities.length;
      const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

      return {
        totalEngagement,
        totalPosts,
        avgEngagement
      };

    } catch (error) {
      console.error('Error getting content engagement summary:', error);
      return { totalEngagement: 0, totalPosts: 0, avgEngagement: 0 };
    }
  }

  /**
   * Get industry insights
   */
  async getIndustryInsights(userId, startDate, endDate) {
    try {
      // This would typically connect to external APIs or analyze platform data
      // For now, return some sample insights
      return [
        {
          type: 'industry_insight',
          title: 'Fashion Week Updates',
          description: 'Latest trends from fashion weeks around the world',
          category: 'trends'
        },
        {
          type: 'industry_insight',
          title: 'Sustainable Fashion Growth',
          description: 'Eco-friendly fashion continues to gain momentum',
          category: 'sustainability'
        }
      ];

    } catch (error) {
      console.error('Error getting industry insights:', error);
      return [];
    }
  }

  /**
   * Get suggested actions for user
   */
  async getSuggestedActions(userId) {
    try {
      const suggestions = [];

      // Check profile completion
      const user = await User.findById(userId);
      if (user.profileCompletionScore < 80) {
        suggestions.push({
          type: 'suggested_action',
          title: 'Complete Your Profile',
          description: `Your profile is ${user.profileCompletionScore}% complete`,
          action: 'complete_profile',
          priority: 'high'
        });
      }

      // Check recent activity
      const recentActivity = await Activity.countDocuments({
        actor: userId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (recentActivity === 0) {
        suggestions.push({
          type: 'suggested_action',
          title: 'Share an Update',
          description: 'Stay active by sharing your latest work or insights',
          action: 'create_post',
          priority: 'medium'
        });
      }

      return suggestions;

    } catch (error) {
      console.error('Error getting suggested actions:', error);
      return [];
    }
  }

  /**
   * Get user's professional field
   */
  async getUserProfessionalField(userId) {
    try {
      const user = await User.findById(userId);
      const fieldMap = {
        'fashion-designer': 'Fashion Design',
        'stylist': 'Fashion Styling',
        'photographer': 'Fashion Photography',
        'makeup-artist': 'Beauty & Makeup',
        'model': 'Modeling',
        'brand': 'Fashion Brands',
        'agency': 'Fashion Agencies'
      };

      return fieldMap[user.professionalType] || 'Fashion Industry';

    } catch (error) {
      console.error('Error getting user professional field:', error);
      return 'Fashion Industry';
    }
  }

  /**
   * Clean up old digest notifications
   */
  async cleanupOldDigests(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await Notification.deleteMany({
        type: { $in: ['daily_digest', 'weekly_digest', 'monthly_digest'] },
        createdAt: { $lt: cutoffDate }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old digest notifications`);
      return result.deletedCount;

    } catch (error) {
      console.error('Error cleaning up old digests:', error);
      return 0;
    }
  }
}

module.exports = new DigestService(); 
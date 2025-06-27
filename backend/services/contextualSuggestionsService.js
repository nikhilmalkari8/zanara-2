const User = require('../models/User');
const Connection = require('../models/Connection');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const smartTimingService = require('./smartTimingService');
const birthdayService = require('./birthdayService');

class ContextualSuggestionsService {
  constructor() {
    this.suggestionTypes = [
      'congratulate_job',
      'congratulate_milestone',
      'connect_mutual',
      'reconnect_old',
      'celebrate_achievement',
      'industry_introduction'
    ];

    this.careerKeywords = [
      'new job', 'promoted', 'promotion', 'hired', 'joined', 'started',
      'new position', 'new role', 'career move', 'excited to announce',
      'thrilled to share', 'pleased to announce'
    ];

    this.milestoneKeywords = [
      'anniversary', 'years at', 'milestone', 'achievement', 'award',
      'recognition', 'featured', 'published', 'launched', 'completed'
    ];
  }

  /**
   * Generate contextual suggestions for all active users
   */
  async generateContextualSuggestions() {
    try {
      console.log('🎯 Generating contextual suggestions...');

      const activeUsers = await User.find({
        lastActiveAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
        }
      }).select('_id firstName lastName professionalType');

      let totalSuggestions = 0;

      for (const user of activeUsers) {
        try {
          const suggestions = await this.generateUserSuggestions(user._id);
          totalSuggestions += suggestions;

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`Error generating suggestions for ${user.firstName}:`, error);
        }
      }

      console.log(`✅ Generated ${totalSuggestions} contextual suggestions`);
      return totalSuggestions;

    } catch (error) {
      console.error('Error generating contextual suggestions:', error);
      return 0;
    }
  }

  /**
   * Generate suggestions for a specific user
   */
  async generateUserSuggestions(userId) {
    try {
      let suggestionCount = 0;

      // 1. Job change congratulations
      suggestionCount += await this.generateJobCongratulations(userId);

      // 2. Career milestone celebrations
      suggestionCount += await this.generateMilestoneCelebrations(userId);

      // 3. Mutual connection suggestions
      suggestionCount += await this.generateMutualConnectionSuggestions(userId);

      // 4. Reconnection suggestions
      suggestionCount += await this.generateReconnectionSuggestions(userId);

      // 5. Achievement celebrations
      suggestionCount += await this.generateAchievementCelebrations(userId);

      // 6. Industry introduction suggestions
      suggestionCount += await this.generateIndustryIntroductions(userId);

      return suggestionCount;

    } catch (error) {
      console.error('Error generating user suggestions:', error);
      return 0;
    }
  }

  /**
   * Generate job change congratulation suggestions
   */
  async generateJobCongratulations(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return 0;

      // Get user's connections
      const connections = await this.getUserConnections(userId);
      if (connections.length === 0) return 0;

      // Look for recent job-related activities from connections
      const recentActivities = await Activity.find({
        actor: { $in: connections },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        visibility: { $in: ['public', 'connections'] }
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ createdAt: -1 });

      let suggestionCount = 0;

      for (const activity of recentActivities) {
        const hasJobKeyword = this.careerKeywords.some(keyword => 
          (activity.title?.toLowerCase() || '').includes(keyword) ||
          (activity.description?.toLowerCase() || '').includes(keyword)
        );

        if (hasJobKeyword) {
          await this.sendJobCongratulationSuggestion(userId, activity);
          suggestionCount++;

          // Limit to prevent spam
          if (suggestionCount >= 3) break;
        }
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating job congratulations:', error);
      return 0;
    }
  }

  /**
   * Generate milestone celebration suggestions
   */
  async generateMilestoneCelebrations(userId) {
    try {
      const connections = await this.getUserConnections(userId);
      if (connections.length === 0) return 0;

      // Look for milestone-related activities
      const milestoneActivities = await Activity.find({
        actor: { $in: connections },
        createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        visibility: { $in: ['public', 'connections'] }
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ createdAt: -1 });

      let suggestionCount = 0;

      for (const activity of milestoneActivities) {
        const hasMilestoneKeyword = this.milestoneKeywords.some(keyword => 
          (activity.title?.toLowerCase() || '').includes(keyword) ||
          (activity.description?.toLowerCase() || '').includes(keyword)
        );

        if (hasMilestoneKeyword) {
          await this.sendMilestoneCelebrationSuggestion(userId, activity);
          suggestionCount++;

          if (suggestionCount >= 2) break;
        }
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating milestone celebrations:', error);
      return 0;
    }
  }

  /**
   * Generate mutual connection suggestions
   */
  async generateMutualConnectionSuggestions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return 0;

      const mutualConnections = await this.findMutualConnections(userId);
      
      if (mutualConnections.length === 0) return 0;

      // Sort by mutual connection count and professional relevance
      const sortedSuggestions = mutualConnections
        .filter(suggestion => suggestion.mutualCount >= 2)
        .sort((a, b) => {
          // Prioritize same professional type
          const aSameProfession = a.user.professionalType === user.professionalType ? 1 : 0;
          const bSameProfession = b.user.professionalType === user.professionalType ? 1 : 0;
          
          if (aSameProfession !== bSameProfession) {
            return bSameProfession - aSameProfession;
          }
          
          return b.mutualCount - a.mutualCount;
        })
        .slice(0, 3);

      let suggestionCount = 0;

      for (const suggestion of sortedSuggestions) {
        await this.sendMutualConnectionSuggestion(userId, suggestion);
        suggestionCount++;
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating mutual connection suggestions:', error);
      return 0;
    }
  }

  /**
   * Generate reconnection suggestions
   */
  async generateReconnectionSuggestions(userId) {
    try {
      // Find connections that haven't interacted recently
      const oldConnections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ],
        lastInteraction: {
          $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        }
      })
      .populate('requester recipient', 'firstName lastName professionalType profilePicture')
      .sort({ connectionStrength: -1 })
      .limit(5);

      let suggestionCount = 0;

      for (const connection of oldConnections) {
        const otherUser = connection.requester._id.toString() === userId.toString() 
          ? connection.recipient 
          : connection.requester;

        // Check if the other user has been active recently
        if (otherUser.lastActiveAt && 
            otherUser.lastActiveAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          
          await this.sendReconnectionSuggestion(userId, otherUser, connection);
          suggestionCount++;

          if (suggestionCount >= 2) break;
        }
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating reconnection suggestions:', error);
      return 0;
    }
  }

  /**
   * Generate achievement celebration suggestions
   */
  async generateAchievementCelebrations(userId) {
    try {
      const connections = await this.getUserConnections(userId);
      if (connections.length === 0) return 0;

      // Look for high-engagement activities (potential achievements)
      const achievementActivities = await Activity.find({
        actor: { $in: connections },
        createdAt: { $gte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        'engagement.totalReactions': { $gte: 10 },
        visibility: { $in: ['public', 'connections'] }
      })
      .populate('actor', 'firstName lastName professionalType profilePicture')
      .sort({ 'engagement.totalReactions': -1 })
      .limit(3);

      let suggestionCount = 0;

      for (const activity of achievementActivities) {
        await this.sendAchievementCelebrationSuggestion(userId, activity);
        suggestionCount++;
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating achievement celebrations:', error);
      return 0;
    }
  }

  /**
   * Generate industry introduction suggestions
   */
  async generateIndustryIntroductions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return 0;

      // Find influential users in the same professional field
      const industryInfluencers = await User.find({
        professionalType: user.professionalType,
        _id: { $ne: userId },
        profileViews: { $gte: 100 },
        connectionsCount: { $gte: 50 }
      })
      .select('firstName lastName professionalType profilePicture profileViews connectionsCount')
      .sort({ profileViews: -1, connectionsCount: -1 })
      .limit(2);

      let suggestionCount = 0;

      for (const influencer of industryInfluencers) {
        // Check if already connected
        const existingConnection = await Connection.findOne({
          $or: [
            { requester: userId, recipient: influencer._id },
            { requester: influencer._id, recipient: userId }
          ]
        });

        if (!existingConnection) {
          await this.sendIndustryIntroductionSuggestion(userId, influencer);
          suggestionCount++;
        }
      }

      return suggestionCount;

    } catch (error) {
      console.error('Error generating industry introductions:', error);
      return 0;
    }
  }

  /**
   * Send job congratulation suggestion
   */
  async sendJobCongratulationSuggestion(userId, activity) {
    try {
      const congratulationMessages = [
        "Congratulations on your new role! 🎉",
        "Exciting news about your career move! 👏",
        "Wishing you success in your new position! 🌟",
        "Thrilled to see your career growth! 🚀",
        "Congratulations on this amazing opportunity! 🎊"
      ];

      const message = congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)];

      const notificationData = {
        recipient: userId,
        sender: activity.actor._id,
        type: 'congratulate_job_suggestion',
        title: `💼 Congratulate ${activity.actor.firstName} on their new role!`,
        message: `${activity.actor.firstName} ${activity.actor.lastName} shared career news. ${message}`,
        metadata: {
          suggestionType: 'congratulate_job',
          targetUserId: activity.actor._id,
          targetUserName: `${activity.actor.firstName} ${activity.actor.lastName}`,
          activityId: activity._id,
          suggestedMessage: message,
          actionType: 'send_congratulation'
        },
        priority: 'normal',
        actionUrl: `/profile/${activity.actor._id}`,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending job congratulation suggestion:', error);
      return false;
    }
  }

  /**
   * Send milestone celebration suggestion
   */
  async sendMilestoneCelebrationSuggestion(userId, activity) {
    try {
      const celebrationMessages = [
        "What an incredible milestone! 🏆",
        "Amazing achievement! So proud of you! 👏",
        "Celebrating this fantastic accomplishment! 🎉",
        "Your hard work is paying off! 🌟",
        "Inspiring to see your success! ✨"
      ];

      const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

      const notificationData = {
        recipient: userId,
        sender: activity.actor._id,
        type: 'celebrate_milestone_suggestion',
        title: `🏆 Celebrate ${activity.actor.firstName}'s milestone!`,
        message: `${activity.actor.firstName} ${activity.actor.lastName} achieved something special. ${message}`,
        metadata: {
          suggestionType: 'celebrate_milestone',
          targetUserId: activity.actor._id,
          targetUserName: `${activity.actor.firstName} ${activity.actor.lastName}`,
          activityId: activity._id,
          suggestedMessage: message,
          actionType: 'send_celebration'
        },
        priority: 'normal',
        actionUrl: `/profile/${activity.actor._id}`,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending milestone celebration suggestion:', error);
      return false;
    }
  }

  /**
   * Send mutual connection suggestion
   */
  async sendMutualConnectionSuggestion(userId, suggestion) {
    try {
      const notificationData = {
        recipient: userId,
        sender: suggestion.user._id,
        type: 'mutual_connection_suggestion',
        title: `🤝 Connect with ${suggestion.user.firstName}?`,
        message: `You have ${suggestion.mutualCount} mutual connections with ${suggestion.user.firstName} ${suggestion.user.lastName}, a ${suggestion.user.professionalType.replace('-', ' ')} in your network.`,
        metadata: {
          suggestionType: 'connect_mutual',
          targetUserId: suggestion.user._id,
          targetUserName: `${suggestion.user.firstName} ${suggestion.user.lastName}`,
          mutualCount: suggestion.mutualCount,
          mutualConnections: suggestion.mutualConnections.slice(0, 3),
          actionType: 'send_connection_request'
        },
        priority: 'low',
        actionUrl: `/profile/${suggestion.user._id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending mutual connection suggestion:', error);
      return false;
    }
  }

  /**
   * Send reconnection suggestion
   */
  async sendReconnectionSuggestion(userId, otherUser, connection) {
    try {
      const reconnectionMessages = [
        `It's been a while since you connected with ${otherUser.firstName}. Why not reach out?`,
        `${otherUser.firstName} has been active recently. Great time to reconnect!`,
        `Catch up with ${otherUser.firstName} and see what they've been up to!`,
        `Rekindle your connection with ${otherUser.firstName}!`
      ];

      const message = reconnectionMessages[Math.floor(Math.random() * reconnectionMessages.length)];

      const notificationData = {
        recipient: userId,
        sender: otherUser._id,
        type: 'reconnection_suggestion',
        title: `🔄 Reconnect with ${otherUser.firstName}`,
        message: message,
        metadata: {
          suggestionType: 'reconnect_old',
          targetUserId: otherUser._id,
          targetUserName: `${otherUser.firstName} ${otherUser.lastName}`,
          lastInteraction: connection.lastInteraction,
          connectionStrength: connection.connectionStrength?.score || 0,
          actionType: 'send_message'
        },
        priority: 'low',
        actionUrl: `/profile/${otherUser._id}`,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending reconnection suggestion:', error);
      return false;
    }
  }

  /**
   * Send achievement celebration suggestion
   */
  async sendAchievementCelebrationSuggestion(userId, activity) {
    try {
      const notificationData = {
        recipient: userId,
        sender: activity.actor._id,
        type: 'achievement_celebration_suggestion',
        title: `🎊 ${activity.actor.firstName}'s post is getting lots of love!`,
        message: `${activity.actor.firstName}'s recent post has ${activity.engagement.totalReactions} reactions. Show your support!`,
        metadata: {
          suggestionType: 'celebrate_achievement',
          targetUserId: activity.actor._id,
          targetUserName: `${activity.actor.firstName} ${activity.actor.lastName}`,
          activityId: activity._id,
          engagementCount: activity.engagement.totalReactions,
          actionType: 'react_to_post'
        },
        priority: 'low',
        actionUrl: `/activity/${activity._id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending achievement celebration suggestion:', error);
      return false;
    }
  }

  /**
   * Send industry introduction suggestion
   */
  async sendIndustryIntroductionSuggestion(userId, influencer) {
    try {
      const notificationData = {
        recipient: userId,
        sender: influencer._id,
        type: 'industry_introduction_suggestion',
        title: `🌟 Connect with ${influencer.firstName}?`,
        message: `${influencer.firstName} ${influencer.lastName} is a well-connected ${influencer.professionalType.replace('-', ' ')} with ${influencer.connectionsCount}+ connections. Consider reaching out!`,
        metadata: {
          suggestionType: 'industry_introduction',
          targetUserId: influencer._id,
          targetUserName: `${influencer.firstName} ${influencer.lastName}`,
          targetConnections: influencer.connectionsCount,
          targetProfileViews: influencer.profileViews,
          actionType: 'send_connection_request'
        },
        priority: 'low',
        actionUrl: `/profile/${influencer._id}`,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      };

      await smartTimingService.scheduleOptimalNotification(notificationData, userId);
      return true;

    } catch (error) {
      console.error('Error sending industry introduction suggestion:', error);
      return false;
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
   * Find mutual connections for a user
   */
  async findMutualConnections(userId) {
    try {
      const userConnections = await this.getUserConnections(userId);
      if (userConnections.length === 0) return [];

      const mutualSuggestions = [];

      // Get connections of user's connections
      const connectionConnections = await Connection.find({
        $or: [
          { requester: { $in: userConnections }, status: 'accepted' },
          { recipient: { $in: userConnections }, status: 'accepted' }
        ]
      }).populate('requester recipient', 'firstName lastName professionalType profilePicture');

      // Count mutual connections
      const mutualCounts = {};

      for (const conn of connectionConnections) {
        const potentialConnection = conn.requester._id.toString() === userId.toString() 
          ? conn.recipient 
          : conn.requester;

        const potentialId = potentialConnection._id.toString();

        // Skip if it's the user themselves or already connected
        if (potentialId === userId.toString() || userConnections.includes(potentialId)) {
          continue;
        }

        if (!mutualCounts[potentialId]) {
          mutualCounts[potentialId] = {
            user: potentialConnection,
            mutualCount: 0,
            mutualConnections: []
          };
        }

        mutualCounts[potentialId].mutualCount++;
        
        const mutualConnection = conn.requester._id.toString() === potentialId 
          ? conn.recipient 
          : conn.requester;
        
        if (userConnections.includes(mutualConnection._id.toString())) {
          mutualCounts[potentialId].mutualConnections.push(mutualConnection);
        }
      }

      // Convert to array and filter
      return Object.values(mutualCounts)
        .filter(suggestion => suggestion.mutualCount >= 2)
        .slice(0, 10);

    } catch (error) {
      console.error('Error finding mutual connections:', error);
      return [];
    }
  }

  /**
   * Clean up expired suggestion notifications
   */
  async cleanupExpiredSuggestions() {
    try {
      const result = await Notification.deleteMany({
        type: { 
          $in: [
            'congratulate_job_suggestion',
            'celebrate_milestone_suggestion',
            'mutual_connection_suggestion',
            'reconnection_suggestion',
            'achievement_celebration_suggestion',
            'industry_introduction_suggestion'
          ] 
        },
        expiresAt: { $lt: new Date() }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} expired suggestion notifications`);
      return result.deletedCount;

    } catch (error) {
      console.error('Error cleaning up expired suggestions:', error);
      return 0;
    }
  }

  /**
   * Get suggestion statistics
   */
  async getSuggestionStats() {
    try {
      const stats = {};

      for (const type of this.suggestionTypes) {
        const count = await Notification.countDocuments({
          type: `${type}_suggestion`,
          createdAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        });
        stats[type] = count;
      }

      return stats;

    } catch (error) {
      console.error('Error getting suggestion stats:', error);
      return {};
    }
  }
}

module.exports = new ContextualSuggestionsService(); 
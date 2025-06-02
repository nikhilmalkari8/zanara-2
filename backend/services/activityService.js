const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Connection = require('../models/Connection');

class ActivityService {
  
  // Create profile update activity
  static async createProfileUpdateActivity(userId, updateType, details = {}) {
    try {
      const activityData = {
        actor: userId,
        type: 'profile_update',
        title: `Profile ${updateType} updated`,
        description: `Updated ${updateType} information`,
        metadata: {
          updateType,
          ...details
        },
        visibility: 'connections'
      };
      
      return await Activity.createActivity(activityData);
    } catch (error) {
      console.error('Error creating profile update activity:', error);
    }
  }
  
  // Create new connection activity
  static async createConnectionActivity(connectionId, requesterId, recipientId) {
    try {
      const activityData = {
        actor: requesterId,
        type: 'new_connection',
        title: 'New professional connection',
        description: 'Connected with a new professional',
        relatedObjects: {
          connection: connectionId,
          user: recipientId
        },
        visibility: 'connections'
      };
      
      const activity = await Activity.createActivity(activityData);
      
      // Create notification for the recipient
      await Notification.createNotification({
        recipient: recipientId,
        sender: requesterId,
        type: 'connection_accepted',
        title: 'New Connection',
        message: 'You have a new professional connection',
        relatedActivity: activity._id,
        relatedObjects: {
          connection: connectionId
        }
      });
      
      return activity;
    } catch (error) {
      console.error('Error creating connection activity:', error);
    }
  }
  
  // Create opportunity posted activity
  static async createOpportunityActivity(opportunityId, companyId, opportunityData) {
    try {
      const activityData = {
        actor: companyId,
        type: 'opportunity_posted',
        title: `New ${opportunityData.type} opportunity`,
        description: opportunityData.title,
        relatedObjects: {
          opportunity: opportunityId
        },
        metadata: {
          location: opportunityData.location?.city,
          opportunityType: opportunityData.type,
          compensationType: opportunityData.compensation?.type,
          industry: 'modeling'
        },
        visibility: 'public',
        priority: 'high'
      };
      
      const activity = await Activity.createActivity(activityData);
      
      // Notify relevant users (this could be enhanced with better targeting)
      // For now, we'll just create the activity and let the feed algorithm handle it
      
      return activity;
    } catch (error) {
      console.error('Error creating opportunity activity:', error);
    }
  }
  
  // Create opportunity application activity
  static async createApplicationActivity(userId, opportunityId, companyId) {
    try {
      const activityData = {
        actor: userId,
        type: 'opportunity_applied',
        title: 'Applied to new opportunity',
        description: 'Submitted application for modeling opportunity',
        relatedObjects: {
          opportunity: opportunityId
        },
        visibility: 'connections'
      };
      
      const activity = await Activity.createActivity(activityData);
      
      // Notify company about new application
      await Notification.createNotification({
        recipient: companyId,
        sender: userId,
        type: 'opportunity_application',
        title: 'New Application',
        message: 'Someone applied to your opportunity',
        relatedActivity: activity._id,
        relatedObjects: {
          opportunity: opportunityId
        }
      });
      
      return activity;
    } catch (error) {
      console.error('Error creating application activity:', error);
    }
  }
  
  // Create achievement activity
  static async createAchievementActivity(userId, achievement) {
    try {
      const activityData = {
        actor: userId,
        type: 'achievement_added',
        title: 'New achievement unlocked',
        description: achievement.description || 'Reached a new milestone',
        metadata: {
          achievementType: achievement.type,
          achievementName: achievement.name
        },
        visibility: 'public',
        priority: 'normal'
      };
      
      return await Activity.createActivity(activityData);
    } catch (error) {
      console.error('Error creating achievement activity:', error);
    }
  }
  
  // Create company update activity
  static async createCompanyUpdateActivity(companyId, updateType, details = {}) {
    try {
      const activityData = {
        actor: companyId,
        type: 'company_update',
        title: `Company ${updateType}`,
        description: details.description || `Updated ${updateType}`,
        relatedObjects: {
          company: companyId
        },
        metadata: {
          updateType,
          ...details
        },
        visibility: 'public'
      };
      
      return await Activity.createActivity(activityData);
    } catch (error) {
      console.error('Error creating company update activity:', error);
    }
  }
  
  // Create deadline reminder activity
  static async createDeadlineReminderActivity(opportunityId, deadline) {
    try {
      const activityData = {
        actor: null, // System generated
        type: 'opportunity_deadline_reminder',
        title: 'Application deadline approaching',
        description: `Opportunity application deadline is in 24 hours`,
        relatedObjects: {
          opportunity: opportunityId
        },
        visibility: 'public',
        priority: 'high',
        isSystemGenerated: true,
        expiresAt: new Date(deadline)
      };
      
      return await Activity.createActivity(activityData);
    } catch (error) {
      console.error('Error creating deadline reminder activity:', error);
    }
  }

  // NEW: Create content activity
  static async createContentActivity(userId, contentId, contentData) {
    try {
      const activityData = {
        actor: userId,
        type: contentData.type || 'content_published',
        title: `Published new content: ${contentData.title}`,
        description: `Shared insights about ${contentData.category.replace('-', ' ')}`,
        relatedObjects: {
          content: contentId
        },
        metadata: {
          contentCategory: contentData.category,
          contentType: 'article',
          industry: 'modeling'
        },
        visibility: 'public',
        priority: 'normal'
      };
      
      return await Activity.createActivity(activityData);
    } catch (error) {
      console.error('Error creating content activity:', error);
    }
  }

  // NEW: Create content engagement activity
  static async createContentEngagementActivity(userId, contentId, engagementData) {
    try {
      const { type, contentTitle, authorId, comment } = engagementData;
      
      let title, description;
      switch (type) {
        case 'content_liked':
          title = 'Content liked';
          description = `Liked "${contentTitle}"`;
          break;
        case 'content_commented':
          title = 'New comment on content';
          description = `Commented on "${contentTitle}"`;
          break;
        default:
          title = 'Content engagement';
          description = `Engaged with "${contentTitle}"`;
      }

      const activityData = {
        actor: userId,
        type: type,
        title: title,
        description: description,
        relatedObjects: {
          content: contentId,
          user: authorId
        },
        metadata: {
          contentTitle,
          comment: comment || null
        },
        visibility: 'connections'
      };
      
      const activity = await Activity.createActivity(activityData);

      // Create notification for content author
      if (authorId && authorId.toString() !== userId.toString()) {
        await Notification.createNotification({
          recipient: authorId,
          sender: userId,
          type: type,
          title: title,
          message: type === 'content_liked' 
            ? `Someone liked your content "${contentTitle}"` 
            : `Someone commented on your content "${contentTitle}"`,
          relatedActivity: activity._id,
          relatedObjects: {
            content: contentId
          }
        });
      }
      
      return activity;
    } catch (error) {
      console.error('Error creating content engagement activity:', error);
    }
  }
  
  // Get user's activity feed
  static async getUserFeed(userId, options = {}) {
    try {
      // Get user's connections
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      }).lean();
      
      const connectionUserIds = connections.map(conn => 
        conn.requester.toString() === userId.toString() 
          ? conn.recipient 
          : conn.requester
      );
      
      // Get activities
      const activities = await Activity.getUserFeed(userId, {
        ...options,
        connections: connectionUserIds
      });
      
      return activities;
    } catch (error) {
      console.error('Error getting user feed:', error);
      throw error;
    }
  }
  
  // Like activity
  static async likeActivity(activityId, userId) {
    try {
      const activity = await Activity.findById(activityId);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      const alreadyLiked = activity.engagement.likes.some(
        like => like.user.toString() === userId.toString()
      );
      
      if (alreadyLiked) {
        // Unlike
        activity.engagement.likes = activity.engagement.likes.filter(
          like => like.user.toString() !== userId.toString()
        );
      } else {
        // Like
        activity.engagement.likes.push({
          user: userId,
          likedAt: new Date()
        });
        
        // Create notification for activity owner
        if (activity.actor && activity.actor.toString() !== userId.toString()) {
          await Notification.createNotification({
            recipient: activity.actor,
            sender: userId,
            type: 'activity_like',
            title: 'Activity Liked',
            message: 'Someone liked your activity',
            relatedActivity: activityId
          });
        }
      }
      
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error liking activity:', error);
      throw error;
    }
  }
  
  // Comment on activity
  static async commentOnActivity(activityId, userId, comment) {
    try {
      const activity = await Activity.findById(activityId);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      activity.engagement.comments.push({
        user: userId,
        comment: comment,
        commentedAt: new Date()
      });
      
      await activity.save();
      
      // Create notification for activity owner
      if (activity.actor && activity.actor.toString() !== userId.toString()) {
        await Notification.createNotification({
          recipient: activity.actor,
          sender: userId,
          type: 'activity_comment',
          title: 'New Comment',
          message: 'Someone commented on your activity',
          relatedActivity: activityId
        });
      }
      
      return activity;
    } catch (error) {
      console.error('Error commenting on activity:', error);
      throw error;
    }
  }
}

module.exports = ActivityService;
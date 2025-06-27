const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User receiving the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // User who triggered the notification
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type of notification
  type: {
    type: String,
    required: true,
    enum: [
      'new_connection_request',
      'connection_accepted',
      'new_opportunity',
      'opportunity_application',
      'opportunity_deadline',
      'profile_view',
      'activity_like',
      'activity_comment',
      'activity_share',
      'activity_reaction',
      'introduction_request',
      'opportunity_update',
      'system_announcement',
      'batched_reactions',
      'batched_comments',
      'batched_profile_views',
      'batched_connections'
    ]
  },
  
  // Notification title
  title: {
    type: String,
    required: true
  },
  
  // Notification message
  message: {
    type: String,
    required: true
  },
  
  // Related activity or object
  relatedActivity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  
  relatedObjects: {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection'
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    }
  },
  
  // Notification status
  status: {
    type: String,
    default: 'unread',
    enum: ['unread', 'read', 'archived']
  },
  
  // Priority level
  priority: {
    type: String,
    default: 'normal',
    enum: ['low', 'normal', 'high', 'urgent']
  },
  
  // Action URL for navigation
  actionUrl: String,
  
  // Read timestamp
  readAt: Date,
  
  // Expiration for time-sensitive notifications
  expiresAt: Date,

  // WEEK 2: Batching functionality
  isBatched: {
    type: Boolean,
    default: false
  },

  batchData: {
    batchId: String, // Unique identifier for the batch
    count: { type: Number, default: 1 },
    actors: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      action: String,
      timestamp: { type: Date, default: Date.now }
    }],
    lastActivity: { type: Date, default: Date.now },
    batchType: {
      type: String,
      enum: ['reactions', 'comments', 'profile_views', 'connections', 'shares']
    }
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ 'batchData.batchId': 1 });
notificationSchema.index({ isBatched: 1, recipient: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// WEEK 2: Batched notification creation with intelligent grouping
notificationSchema.statics.createOrBatchNotification = async function(notificationData) {
  try {
    const { recipient, sender, type, relatedActivity, batchType } = notificationData;
    
    // Check if this type of notification should be batched
    const batchableTypes = ['activity_reaction', 'activity_like', 'activity_comment', 'profile_view'];
    
    if (!batchableTypes.includes(type) || !batchType) {
      // Create regular notification
      return await this.createNotification(notificationData);
    }

    // Generate batch ID based on recipient, type, and related activity
    const batchId = `${recipient}_${type}_${relatedActivity || 'general'}_${batchType}`;
    
    // Look for existing batch within the last 24 hours
    const existingBatch = await this.findOne({
      recipient,
      isBatched: true,
      'batchData.batchId': batchId,
      'batchData.batchType': batchType,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingBatch) {
      // Update existing batch
      existingBatch.batchData.count += 1;
      existingBatch.batchData.actors.push({
        user: sender,
        action: notificationData.message,
        timestamp: new Date()
      });
      existingBatch.batchData.lastActivity = new Date();
      
      // Update the message to reflect multiple people
      const actorCount = existingBatch.batchData.count;
      const firstActor = existingBatch.batchData.actors[0];
      
      if (actorCount === 2) {
        existingBatch.title = `${firstActor.user.firstName} and 1 other person ${getBatchActionText(batchType)}`;
        existingBatch.message = `${firstActor.user.firstName} and 1 other person ${getBatchActionText(batchType)}`;
      } else {
        existingBatch.title = `${firstActor.user.firstName} and ${actorCount - 1} others ${getBatchActionText(batchType)}`;
        existingBatch.message = `${firstActor.user.firstName} and ${actorCount - 1} others ${getBatchActionText(batchType)}`;
      }
      
      existingBatch.status = 'unread'; // Mark as unread again
      await existingBatch.save();
      
      return existingBatch;
    } else {
      // Create new batched notification
      const batchedNotification = new this({
        ...notificationData,
        isBatched: true,
        batchData: {
          batchId,
          count: 1,
          actors: [{
            user: sender,
            action: notificationData.message,
            timestamp: new Date()
          }],
          lastActivity: new Date(),
          batchType
        }
      });
      
      await batchedNotification.save();
      return batchedNotification;
    }
  } catch (error) {
    console.error('Error creating batched notification:', error);
    // Fallback to regular notification
    return await this.createNotification(notificationData);
  }
};

// Helper function to get batch action text
function getBatchActionText(batchType) {
  const actionMap = {
    'reactions': 'reacted to your post',
    'comments': 'commented on your post',
    'profile_views': 'viewed your profile',
    'connections': 'sent you connection requests',
    'shares': 'shared your post'
  };
  return actionMap[batchType] || 'interacted with your content';
}

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    type = null
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = { recipient: userId };
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('sender', 'firstName lastName userType profilePicture')
    .populate('batchData.actors.user', 'firstName lastName userType profilePicture')
    .populate('relatedObjects.opportunity', 'title type')
    .populate('relatedObjects.company', 'companyName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = []) {
  const query = { recipient: userId };
  
  if (notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, {
    status: 'read',
    readAt: new Date()
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: 'unread'
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
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
      'introduction_request',
      'opportunity_update',
      'system_announcement'
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
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

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
    .populate('sender', 'firstName lastName userType')
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
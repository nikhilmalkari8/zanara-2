const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // User who performed the action (not required for system-generated activities)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isSystemGenerated; }
  },

  // Type of activity (including content-related types)
  type: {
    type: String,
    required: true,
    enum: [
      'profile_update',
      'new_connection',
      'opportunity_posted',
      'opportunity_applied',
      'opportunity_deadline_reminder',
      'profile_view',
      'achievement_added',
      'portfolio_update',
      'company_update',
      'introduction_request',
      'opportunity_filled',
      'new_team_member',
      'company_milestone',
      // Content-related types
      'content_published',
      'content_liked',
      'content_commented'
    ]
  },

  // Activity title/summary
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  // Detailed description
  description: {
    type: String,
    maxlength: 1000
  },

  // Related object references (including content)
  relatedObjects: {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModelProfile'
    },
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connection'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }
  },

  // Metadata for the activity
  metadata: {
    location: String,
    tags: [String],
    industry: String,
    opportunityType: String,
    compensationType: String
  },

  // Visibility settings
  visibility: {
    type: String,
    default: 'public',
    enum: ['public', 'connections', 'private']
  },

  // Engagement metrics
  engagement: {
    views: { type: Number, default: 0 },
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        likedAt: { type: Date, default: Date.now }
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        commentedAt: { type: Date, default: Date.now }
      }
    ],
    shares: { type: Number, default: 0 }
  },

  // Activity importance/priority
  priority: {
    type: String,
    default: 'normal',
    enum: ['low', 'normal', 'high', 'urgent']
  },

  // Expiration for time-sensitive activities (e.g., deadline reminders)
  expiresAt: Date,

  // Flag for system-generated vs user-generated
  isSystemGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'relatedObjects.opportunity': 1 });
activitySchema.index({ 'relatedObjects.company': 1 });
activitySchema.index({ visibility: 1, createdAt: -1 });
activitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for like count
activitySchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Virtual for comment count
activitySchema.virtual('commentCount').get(function() {
  return this.engagement.comments.length;
});

// Method to check if a given user has liked this activity
activitySchema.methods.isLikedBy = function(userId) {
  return this.engagement.likes.some(like => like.user.toString() === userId.toString());
};

// Static method to create a new activity
activitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }
};

// Static method to fetch a user's feed based on connections and system-generated activities
activitySchema.statics.getUserFeed = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    connections = []
  } = options;
  
  // Build query for user's feed
  let query = {
    $or: [
      { visibility: 'public' },
      {
        visibility: 'connections',
        $or: [
          { actor: userId },
          { actor: { $in: connections } }
        ]
      }
    ]
  };
  
  // Filter by activity type if specified
  if (type && type !== 'all') {
    query.type = type;
  }
  
  return this.find(query)
    .populate('actor', 'firstName lastName userType')
    .populate('relatedObjects.opportunity', 'title type location compensation')
    .populate('relatedObjects.company', 'companyName industry')
    .populate('relatedObjects.content', 'title category excerpt coverImage')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
};

module.exports = mongoose.model('Activity', activitySchema);

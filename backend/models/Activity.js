const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // User who performed the action (not required for system-generated activities)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isSystemGenerated; }
  },

  // Type of activity (enhanced with more LinkedIn-like types)
  type: {
    type: String,
    required: true,
    enum: [
      // Existing types
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
      'content_published',
      'content_liked',
      'content_commented',
      // New LinkedIn-like activity types
      'profile_photo_changed',
      'cover_photo_changed',
      'work_anniversary',
      'job_change',
      'education_added',
      'skill_added',
      'skill_endorsed',
      'recommendation_received',
      'recommendation_given',
      'content_shared',
      'content_reacted',
      'hashtag_trending',
      'mentioned_in_post',
      'poll_created',
      'poll_voted',
      'portfolio_before_after',
      'certification_earned',
      'award_received',
      'project_completed',
      'collaboration_started'
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

  // Rich content for posts
  content: {
    text: String,
    hashtags: [String],
    mentions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      displayName: String
    }],
    media: [{
      type: { type: String, enum: ['image', 'video', 'document'] },
      url: String,
      caption: String,
      alt: String
    }],
    poll: {
      question: String,
      options: [{
        text: String,
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }],
      allowMultiple: { type: Boolean, default: false },
      endDate: Date
    }
  },

  // Related object references (enhanced)
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
    },
    originalActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    }
  },

  // Metadata for the activity (enhanced)
  metadata: {
    location: String,
    tags: [String],
    industry: String,
    opportunityType: String,
    compensationType: String,
    // New metadata fields
    previousValue: String, // For before/after comparisons
    newValue: String,
    changeType: String, // 'photo', 'cover', 'headline', etc.
    skillName: String,
    endorserCount: Number,
    anniversaryYears: Number,
    companyName: String,
    jobTitle: String,
    educationInstitution: String,
    educationDegree: String,
    certificationName: String,
    awardName: String,
    projectName: String
  },

  // Visibility settings
  visibility: {
    type: String,
    default: 'public',
    enum: ['public', 'connections', 'private']
  },

  // Enhanced engagement metrics
  engagement: {
    views: { type: Number, default: 0 },
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { 
        type: String, 
        enum: ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'],
        default: 'like'
      },
      reactedAt: { type: Date, default: Date.now }
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      mentions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String
      }],
      commentedAt: { type: Date, default: Date.now },
      reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { 
          type: String, 
          enum: ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'],
          default: 'like'
        }
      }]
    }],
    shares: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      commentary: String,
      sharedAt: { type: Date, default: Date.now },
      visibility: { 
        type: String, 
        enum: ['public', 'connections', 'private'],
        default: 'connections'
      }
    }]
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
  },

  // Draft system for posts
  isDraft: {
    type: Boolean,
    default: false
  },

  // Scheduled posting
  scheduledFor: Date,

  // Original post reference for shares
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }
}, {
  timestamps: true
});

// Enhanced indexes for performance
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'relatedObjects.opportunity': 1 });
activitySchema.index({ 'relatedObjects.company': 1 });
activitySchema.index({ visibility: 1, createdAt: -1 });
activitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
activitySchema.index({ 'content.hashtags': 1 });
activitySchema.index({ 'content.mentions.user': 1 });
activitySchema.index({ isDraft: 1, actor: 1 });
activitySchema.index({ scheduledFor: 1 });

// Virtual for total reaction count
activitySchema.virtual('reactionCount').get(function() {
  return this.engagement.reactions.length;
});

// Virtual for comment count
activitySchema.virtual('commentCount').get(function() {
  return this.engagement.comments.length;
});

// Virtual for share count
activitySchema.virtual('shareCount').get(function() {
  return this.engagement.shares.length;
});

// Method to check if a given user has reacted to this activity
activitySchema.methods.getReactionByUser = function(userId) {
  return this.engagement.reactions.find(reaction => 
    reaction.user.toString() === userId.toString()
  );
};

// Method to get reaction counts by type
activitySchema.methods.getReactionCounts = function() {
  const counts = {
    like: 0,
    love: 0,
    celebrate: 0,
    support: 0,
    insightful: 0,
    funny: 0
  };
  
  this.engagement.reactions.forEach(reaction => {
    counts[reaction.type]++;
  });
  
  return counts;
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

// Enhanced getUserFeed method with better algorithm
activitySchema.statics.getUserFeed = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    connections = [],
    followedHashtags = []
  } = options;
  
  // Build query for user's feed with enhanced logic
  let query = {
    isDraft: false,
    $or: [
      { visibility: 'public' },
      {
        visibility: 'connections',
        $or: [
          { actor: userId },
          { actor: { $in: connections } }
        ]
      },
      // Include posts with hashtags user follows
      {
        visibility: 'public',
        'content.hashtags': { $in: followedHashtags }
      },
      // Include posts where user is mentioned
      {
        'content.mentions.user': userId
      }
    ]
  };
  
  // Filter by activity type if specified
  if (type && type !== 'all') {
    query.type = type;
  }
  
  return this.find(query)
    .populate('actor', 'firstName lastName userType profilePicture')
    .populate('relatedObjects.opportunity', 'title type location compensation')
    .populate('relatedObjects.company', 'companyName industry')
    .populate('relatedObjects.content', 'title category excerpt coverImage')
    .populate('content.mentions.user', 'firstName lastName userType')
    .populate('engagement.reactions.user', 'firstName lastName')
    .populate('engagement.comments.user', 'firstName lastName')
    .populate('engagement.shares.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
};

// Method to get trending hashtags
activitySchema.statics.getTrendingHashtags = async function(days = 7, limit = 10) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: dateThreshold },
        'content.hashtags': { $exists: true, $ne: [] }
      }
    },
    { $unwind: '$content.hashtags' },
    {
      $group: {
        _id: '$content.hashtags',
        count: { $sum: 1 },
        engagementScore: {
          $sum: {
            $add: [
              { $size: { $ifNull: ['$engagement.reactions', []] } },
              { $size: { $ifNull: ['$engagement.comments', []] } },
              { $multiply: [{ $size: { $ifNull: ['$engagement.shares', []] } }, 2] }
            ]
          }
        }
      }
    },
    { $sort: { engagementScore: -1, count: -1 } },
    { $limit: limit },
    {
      $project: {
        hashtag: '$_id',
        count: 1,
        engagementScore: 1,
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);

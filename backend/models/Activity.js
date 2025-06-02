const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // User who performed the action
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type of activity
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
      'company_milestone'
    ]
  },
  
  // Activity title/summary
  title: {
    type: String,
    required: true
  },
  
  // Detailed description
  description: {
    type: String
  },
  
  // Related object references
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
    likes: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      likedAt: { type: Date, default: Date.now }
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      commentedAt: { type: Date, default: Date.now }
    }],
    shares: { type: Number, default: 0 }
  },
  
  // Activity importance/priority
  priority: {
    type: String,
    default: 'normal',
    enum: ['low', 'normal', 'high', 'urgent']
  },
  
  // Expiration for time-sensitive activities
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

// Method to check if user liked the activity
activitySchema.methods.isLikedBy = function(userId) {
  return this.engagement.likes.some(like => like.user.toString() === userId.toString());
};

// Static method to create activity
activitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }
};

// Static method to get user feed
activitySchema.statics.getUserFeed = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    connections = []
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build query
  const query = {
    $or: [
      { actor: userId }, // User's own activities
      { actor: { $in: connections } }, // Connections' activities
      { isSystemGenerated: true, visibility: 'public' } // System-generated public activities
    ]
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('actor', 'firstName lastName userType')
    .populate('relatedObjects.opportunity', 'title type compensation.type location.city')
    .populate('relatedObjects.company', 'companyName industry')
    .populate('relatedObjects.user', 'firstName lastName userType')
    .populate('engagement.likes.user', 'firstName lastName')
    .populate('engagement.comments.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Activity', activitySchema);
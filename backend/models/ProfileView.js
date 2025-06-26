const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  viewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  profileOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Track the type of view
  viewType: {
    type: String,
    enum: ['profile', 'portfolio', 'quick-view'],
    default: 'profile'
  },
  
  // Track duration if available (in seconds)
  duration: {
    type: Number,
    default: 0
  },
  
  // Track what page/component triggered the view
  source: {
    type: String,
    enum: ['browse-talent', 'search', 'connections', 'opportunities', 'direct-link', 'recommendations'],
    default: 'direct-link'
  },
  
  // User agent for analytics
  userAgent: String,
  
  // IP address (hashed for privacy)
  ipHash: String,
  
  // Location data if available
  location: {
    country: String,
    city: String
  }
  
}, {
  timestamps: true
});

// Compound indexes
profileViewSchema.index({ viewerId: 1, profileOwnerId: 1 });
profileViewSchema.index({ profileOwnerId: 1, createdAt: -1 });
profileViewSchema.index({ createdAt: 1 }); // For cleanup

// Prevent duplicate views within a short timeframe (5 minutes)
profileViewSchema.index({ 
  viewerId: 1, 
  profileOwnerId: 1, 
  createdAt: 1 
}, { 
  unique: true,
  partialFilterExpression: {
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  }
});

// Static method to record a profile view
profileViewSchema.statics.recordView = async function(viewerId, profileOwnerId, options = {}) {
  // Don't record self-views
  if (viewerId.toString() === profileOwnerId.toString()) {
    return null;
  }
  
  try {
    // Check if this user already viewed this profile in the last 5 minutes
    const recentView = await this.findOne({
      viewerId,
      profileOwnerId,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    
    if (recentView) {
      return recentView; // Don't create duplicate
    }
    
    // Create new view record
    const profileView = new this({
      viewerId,
      profileOwnerId,
      viewType: options.viewType || 'profile',
      source: options.source || 'direct-link',
      userAgent: options.userAgent,
      ipHash: options.ipHash,
      location: options.location
    });
    
    await profileView.save();
    
    // Update analytics for the profile owner
    const Analytics = require('./Analytics');
    let analytics = await Analytics.findOne({ userId: profileOwnerId });
    
    if (!analytics) {
      analytics = new Analytics({ userId: profileOwnerId });
    }
    
    await analytics.incrementProfileViews();
    
    return profileView;
    
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - view already recorded recently
      return null;
    }
    throw error;
  }
};

// Static method to get view statistics
profileViewSchema.statics.getViewStats = async function(profileOwnerId, timeframe = '30d') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const pipeline = [
    {
      $match: {
        profileOwnerId: mongoose.Types.ObjectId(profileOwnerId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueViewers: { $addToSet: '$viewerId' },
        viewsBySource: {
          $push: '$source'
        },
        viewsByType: {
          $push: '$viewType'
        }
      }
    },
    {
      $project: {
        totalViews: 1,
        uniqueViewers: { $size: '$uniqueViewers' },
        viewsBySource: 1,
        viewsByType: 1
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalViews: 0,
    uniqueViewers: 0,
    viewsBySource: [],
    viewsByType: []
  };
};

// Static method to cleanup old views (for data management)
profileViewSchema.statics.cleanupOldViews = async function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('ProfileView', profileViewSchema); 
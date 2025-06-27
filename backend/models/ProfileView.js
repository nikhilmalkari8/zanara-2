const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  // Profile being viewed
  profileOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // User who viewed the profile (null for anonymous views)
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Session tracking for anonymous users
  sessionId: {
    type: String,
    index: true
  },
  
  // Anonymous view tracking
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Anonymous user data (for analytics while preserving privacy)
  anonymousData: {
    professionalType: String,
    location: String,
    industry: String
  },
  
  // View metadata
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  viewCount: {
    type: Number,
    default: 1
  },
  
  // Source of the view
  source: {
    type: String,
    enum: ['direct', 'search', 'recommendation', 'connection', 'activity', 'message', 'hashtag', 'mention'],
    default: 'direct'
  },
  
  // Connection strength (calculated if not anonymous)
  connectionStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Device and browser info (for analytics)
  deviceInfo: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    browser: String,
    os: String,
    userAgent: String
  },
  
  // Geographic info (anonymized)
  geoData: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Referrer information
  referrer: {
    url: String,
    domain: String,
    searchTerm: String
  },
  
  // Engagement after view
  engagementAfterView: {
    connectionRequested: { type: Boolean, default: false },
    messageSent: { type: Boolean, default: false },
    activityLiked: { type: Boolean, default: false },
    profileViewed: { type: Boolean, default: false }, // Return view
    engagementTime: Date // When engagement happened
  },
  
  // View duration (in seconds)
  viewDuration: {
    type: Number,
    default: 0
  },
  
  // Privacy settings
  trackingAllowed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
profileViewSchema.index({ profileOwner: 1, viewedAt: -1 });
profileViewSchema.index({ viewer: 1, viewedAt: -1 });
profileViewSchema.index({ profileOwner: 1, viewer: 1 });
profileViewSchema.index({ profileOwner: 1, isAnonymous: 1 });
profileViewSchema.index({ sessionId: 1, profileOwner: 1 });
profileViewSchema.index({ source: 1, viewedAt: -1 });

// Compound indexes for analytics queries
profileViewSchema.index({ profileOwner: 1, viewedAt: -1, isAnonymous: 1 });
profileViewSchema.index({ profileOwner: 1, 'anonymousData.professionalType': 1 });
profileViewSchema.index({ profileOwner: 1, 'geoData.city': 1 });

// Static methods for analytics
profileViewSchema.statics.getViewAnalytics = async function(profileOwnerId, period = '30d') {
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const analytics = await this.aggregate([
      {
        $match: {
          profileOwner: new mongoose.Types.ObjectId(profileOwnerId),
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueViewers: { $addToSet: { $ifNull: ['$viewer', '$sessionId'] } },
          returnViews: { $sum: { $cond: [{ $gt: ['$viewCount', 1] }, 1, 0] } },
          avgViewDuration: { $avg: '$viewDuration' },
          totalViewDuration: { $sum: '$viewDuration' }
        }
      },
      {
        $project: {
          totalViews: 1,
          uniqueViewers: { $size: '$uniqueViewers' },
          returnViews: 1,
          avgViewDuration: { $round: ['$avgViewDuration', 2] },
          totalViewDuration: 1
        }
      }
    ]);
    
    return analytics[0] || {
      totalViews: 0,
      uniqueViewers: 0,
      returnViews: 0,
      avgViewDuration: 0,
      totalViewDuration: 0
    };
  } catch (error) {
    console.error('Error getting view analytics:', error);
    return null;
  }
};

// Get hourly view patterns
profileViewSchema.statics.getHourlyPattern = async function(profileOwnerId, period = '30d') {
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const hourlyData = await this.aggregate([
      {
        $match: {
          profileOwner: new mongoose.Types.ObjectId(profileOwnerId),
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$viewedAt' },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Fill in missing hours with 0 views
    const hourlyPattern = new Array(24).fill(0);
    hourlyData.forEach(item => {
      hourlyPattern[item._id] = item.views;
    });
    
    return hourlyPattern.map((views, hour) => ({ hour, views }));
  } catch (error) {
    console.error('Error getting hourly pattern:', error);
    return [];
  }
};

// Get geographic distribution
profileViewSchema.statics.getGeographicDistribution = async function(profileOwnerId, period = '30d') {
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const geoData = await this.aggregate([
      {
        $match: {
          profileOwner: new mongoose.Types.ObjectId(profileOwnerId),
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            city: { $ifNull: ['$geoData.city', { $ifNull: ['$anonymousData.location', 'Unknown'] }] },
            country: '$geoData.country'
          },
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: { $ifNull: ['$viewer', '$sessionId'] } }
        }
      },
      {
        $project: {
          city: '$_id.city',
          country: '$_id.country',
          views: 1,
          uniqueViewers: { $size: '$uniqueViewers' }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    return geoData;
  } catch (error) {
    console.error('Error getting geographic distribution:', error);
    return [];
  }
};

// Get professional type distribution
profileViewSchema.statics.getProfessionalTypeDistribution = async function(profileOwnerId, period = '30d') {
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const typeData = await this.aggregate([
      {
        $match: {
          profileOwner: new mongoose.Types.ObjectId(profileOwnerId),
          viewedAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'viewer',
          foreignField: '_id',
          as: 'viewerData'
        }
      },
      {
        $group: {
          _id: {
            $ifNull: [
              { $arrayElemAt: ['$viewerData.professionalType', 0] },
              '$anonymousData.professionalType'
            ]
          },
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: { $ifNull: ['$viewer', '$sessionId'] } }
        }
      },
      {
        $project: {
          professionalType: '$_id',
          views: 1,
          uniqueViewers: { $size: '$uniqueViewers' }
        }
      },
      {
        $sort: { views: -1 }
      }
    ]);
    
    return typeData.filter(item => item.professionalType);
  } catch (error) {
    console.error('Error getting professional type distribution:', error);
    return [];
  }
};

// Get source distribution
profileViewSchema.statics.getSourceDistribution = async function(profileOwnerId, period = '30d') {
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const sourceData = await this.aggregate([
      {
        $match: {
          profileOwner: new mongoose.Types.ObjectId(profileOwnerId),
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: { $ifNull: ['$viewer', '$sessionId'] } }
        }
      },
      {
        $project: {
          source: '$_id',
          views: 1,
          uniqueViewers: { $size: '$uniqueViewers' }
        }
      },
      {
        $sort: { views: -1 }
      }
    ]);
    
    return sourceData;
  } catch (error) {
    console.error('Error getting source distribution:', error);
    return [];
  }
};

// Method to track engagement after view
profileViewSchema.methods.trackEngagement = async function(engagementType) {
  if (!this.engagementAfterView.engagementTime) {
    this.engagementAfterView.engagementTime = new Date();
  }
  
  switch (engagementType) {
    case 'connection_request':
      this.engagementAfterView.connectionRequested = true;
      break;
    case 'message':
      this.engagementAfterView.messageSent = true;
      break;
    case 'activity_like':
      this.engagementAfterView.activityLiked = true;
      break;
    case 'profile_view':
      this.engagementAfterView.profileViewed = true;
      break;
  }
  
  await this.save();
};

// Pre-save middleware to anonymize data if needed
profileViewSchema.pre('save', function(next) {
  // If anonymous, clear viewer reference
  if (this.isAnonymous) {
    this.viewer = null;
  }
  
  // Ensure view count is at least 1
  if (this.viewCount < 1) {
    this.viewCount = 1;
  }
  
  next();
});

// Virtual for engagement rate
profileViewSchema.virtual('engagementRate').get(function() {
  const engagements = Object.values(this.engagementAfterView).filter(Boolean).length;
  return engagements > 0 ? (engagements / 4) * 100 : 0; // 4 possible engagement types
});

module.exports = mongoose.model('ProfileView', profileViewSchema); 
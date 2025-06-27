const mongoose = require('mongoose');

const contentRelevanceSchema = new mongoose.Schema({
  // Core relationship
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  
  // Overall relevance score (0-100)
  relevanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Individual scoring components
  industryRelevanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  connectionStrengthScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  engagementPredictionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  contentTypePreferenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeDecayScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  trendingScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Detailed scoring factors
  scoringFactors: {
    // Industry relevance
    industryTags: [String],
    industryMatchPercentage: { type: Number, default: 0 },
    skillsMatchPercentage: { type: Number, default: 0 },
    
    // Connection to content creator
    connectionStrength: { type: Number, default: 0 },
    isDirectConnection: { type: Boolean, default: false },
    mutualConnections: { type: Number, default: 0 },
    
    // User's historical engagement patterns
    historicalEngagementRate: { type: Number, default: 0 },
    preferredContentTypes: [String],
    averageTimeSpentOnSimilarContent: { type: Number, default: 0 },
    
    // Content characteristics
    contentType: String,
    contentLength: Number,
    hasMedia: Boolean,
    hashtags: [String],
    mentions: [String],
    
    // Time factors
    contentAge: Number, // in hours
    postedAt: Date,
    timezoneAlignment: Number, // how well posting time aligns with user's active hours
    
    // Trending factors
    engagementVelocity: { type: Number, default: 0 }, // likes/comments per hour
    viralityScore: { type: Number, default: 0 },
    trendingHashtags: [String]
  },
  
  // Prediction confidence
  predictionConfidence: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // A/B testing group
  algorithmVersion: {
    type: String,
    default: 'v1.0'
  },
  
  // Weights for different scoring components (can be A/B tested)
  weights: {
    industryRelevance: { type: Number, default: 25 },
    connectionStrength: { type: Number, default: 30 },
    engagementPrediction: { type: Number, default: 20 },
    contentTypePreference: { type: Number, default: 15 },
    timeDecay: { type: Number, default: 5 },
    trending: { type: Number, default: 5 }
  },
  
  // Actual user interaction (for learning)
  actualInteraction: {
    viewed: { type: Boolean, default: false },
    viewedAt: Date,
    timeSpentViewing: Number, // in seconds
    engaged: { type: Boolean, default: false }, // liked, commented, shared
    engagementType: String, // 'like', 'comment', 'share', 'click'
    engagementAt: Date
  },
  
  // Learning metrics
  predictionAccuracy: {
    viewPredictionCorrect: Boolean,
    engagementPredictionCorrect: Boolean,
    timeSpentPredictionError: Number // difference between predicted and actual
  }
}, {
  timestamps: true,
  indexes: [
    { userId: 1, relevanceScore: -1 },
    { activityId: 1 },
    { createdAt: -1 },
    { 'actualInteraction.viewed': 1 },
    { algorithmVersion: 1 }
  ]
});

// Compound index for efficient querying
contentRelevanceSchema.index({ userId: 1, relevanceScore: -1, createdAt: -1 });

// Methods for calculating different relevance scores
contentRelevanceSchema.methods.calculateIndustryRelevance = function(userProfile, activityContent) {
  let score = 0;
  
  // Industry tags matching
  const userIndustryTags = userProfile.industryTags || [];
  const contentIndustryTags = activityContent.industryTags || [];
  
  if (userIndustryTags.length > 0 && contentIndustryTags.length > 0) {
    const matchingTags = userIndustryTags.filter(tag => contentIndustryTags.includes(tag));
    this.scoringFactors.industryMatchPercentage = (matchingTags.length / userIndustryTags.length) * 100;
    score += this.scoringFactors.industryMatchPercentage * 0.6;
  }
  
  // Skills matching
  const userSkills = userProfile.skills || [];
  const contentSkills = activityContent.skills || [];
  
  if (userSkills.length > 0 && contentSkills.length > 0) {
    const matchingSkills = userSkills.filter(skill => contentSkills.includes(skill));
    this.scoringFactors.skillsMatchPercentage = (matchingSkills.length / userSkills.length) * 100;
    score += this.scoringFactors.skillsMatchPercentage * 0.4;
  }
  
  return Math.min(100, score);
};

contentRelevanceSchema.methods.calculateConnectionStrength = function(connectionStrengthData) {
  if (!connectionStrengthData) return 0;
  
  this.scoringFactors.connectionStrength = connectionStrengthData.overallStrength || 0;
  this.scoringFactors.isDirectConnection = connectionStrengthData.isDirectConnection || false;
  this.scoringFactors.mutualConnections = connectionStrengthData.mutualConnections || 0;
  
  // Direct connections get higher scores
  let score = this.scoringFactors.connectionStrength;
  if (this.scoringFactors.isDirectConnection) {
    score *= 1.2; // 20% boost for direct connections
  }
  
  return Math.min(100, score);
};

contentRelevanceSchema.methods.calculateEngagementPrediction = function(userEngagementHistory) {
  if (!userEngagementHistory) return 50; // Default neutral score
  
  const {
    averageEngagementRate,
    contentTypePreferences,
    timeOfDayPreferences,
    historicalSimilarContentEngagement
  } = userEngagementHistory;
  
  let score = 0;
  
  // Base engagement rate
  score += (averageEngagementRate || 0) * 50;
  
  // Content type preference
  const contentType = this.scoringFactors.contentType;
  if (contentTypePreferences && contentTypePreferences[contentType]) {
    score += contentTypePreferences[contentType] * 30;
  }
  
  // Time alignment
  const currentHour = new Date().getHours();
  if (timeOfDayPreferences && timeOfDayPreferences[currentHour]) {
    score += timeOfDayPreferences[currentHour] * 20;
  }
  
  this.scoringFactors.historicalEngagementRate = averageEngagementRate || 0;
  
  return Math.min(100, score);
};

contentRelevanceSchema.methods.calculateContentTypePreference = function(userPreferences) {
  if (!userPreferences) return 50;
  
  const contentType = this.scoringFactors.contentType;
  const preference = userPreferences[contentType] || 0.5;
  
  return preference * 100;
};

contentRelevanceSchema.methods.calculateTimeDecay = function() {
  const contentAge = this.scoringFactors.contentAge || 0;
  
  // Exponential decay: newer content gets higher scores
  // Half-life of 24 hours
  const halfLife = 24;
  const decayFactor = Math.pow(0.5, contentAge / halfLife);
  
  return decayFactor * 100;
};

contentRelevanceSchema.methods.calculateTrendingScore = function() {
  const {
    engagementVelocity,
    viralityScore,
    trendingHashtags
  } = this.scoringFactors;
  
  let score = 0;
  
  // Engagement velocity (likes/comments per hour)
  score += Math.min(50, (engagementVelocity || 0) * 10);
  
  // Virality score
  score += Math.min(30, (viralityScore || 0) * 30);
  
  // Trending hashtags bonus
  if (trendingHashtags && trendingHashtags.length > 0) {
    score += Math.min(20, trendingHashtags.length * 5);
  }
  
  return Math.min(100, score);
};

contentRelevanceSchema.methods.calculateOverallRelevance = function() {
  // Calculate individual scores
  this.industryRelevanceScore = this.industryRelevanceScore || 0;
  this.connectionStrengthScore = this.connectionStrengthScore || 0;
  this.engagementPredictionScore = this.engagementPredictionScore || 50;
  this.contentTypePreferenceScore = this.contentTypePreferenceScore || 50;
  this.timeDecayScore = this.calculateTimeDecay();
  this.trendingScore = this.calculateTrendingScore();
  
  // Calculate weighted overall score
  const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
  
  const weightedScore = (
    this.industryRelevanceScore * this.weights.industryRelevance +
    this.connectionStrengthScore * this.weights.connectionStrength +
    this.engagementPredictionScore * this.weights.engagementPrediction +
    this.contentTypePreferenceScore * this.weights.contentTypePreference +
    this.timeDecayScore * this.weights.timeDecay +
    this.trendingScore * this.weights.trending
  ) / totalWeight;
  
  this.relevanceScore = Math.round(weightedScore);
  
  return this.relevanceScore;
};

// Static methods for bulk operations
contentRelevanceSchema.statics.calculateRelevanceForUser = async function(userId, activityId, options = {}) {
  const User = mongoose.model('User');
  const Activity = mongoose.model('Activity');
  const ConnectionStrength = mongoose.model('ConnectionStrength');
  
  try {
    // Get user profile and activity data
    const [user, activity] = await Promise.all([
      User.findById(userId),
      Activity.findById(activityId).populate('author')
    ]);
    
    if (!user || !activity) {
      throw new Error('User or Activity not found');
    }
    
    // Find or create relevance record
    let relevance = await this.findOne({ userId, activityId });
    if (!relevance) {
      relevance = new this({ userId, activityId });
    }
    
    // Set algorithm version for A/B testing
    relevance.algorithmVersion = options.algorithmVersion || 'v1.0';
    
    // Set content factors
    relevance.scoringFactors.contentType = activity.type;
    relevance.scoringFactors.contentLength = activity.content?.length || 0;
    relevance.scoringFactors.hasMedia = !!(activity.media && activity.media.length > 0);
    relevance.scoringFactors.hashtags = activity.hashtags || [];
    relevance.scoringFactors.mentions = activity.mentions || [];
    relevance.scoringFactors.postedAt = activity.createdAt;
    relevance.scoringFactors.contentAge = (Date.now() - activity.createdAt.getTime()) / (1000 * 60 * 60); // hours
    
    // Calculate industry relevance
    relevance.industryRelevanceScore = relevance.calculateIndustryRelevance(user, activity);
    
    // Get connection strength if users are connected
    if (activity.author && activity.author._id.toString() !== userId.toString()) {
      const connectionStrength = await ConnectionStrength.findOne({
        $or: [
          { user1: userId, user2: activity.author._id },
          { user1: activity.author._id, user2: userId }
        ]
      });
      
      relevance.connectionStrengthScore = relevance.calculateConnectionStrength(connectionStrength);
    }
    
    // Calculate engagement prediction (would need user engagement history)
    relevance.engagementPredictionScore = relevance.calculateEngagementPrediction(options.userEngagementHistory);
    
    // Calculate content type preference
    relevance.contentTypePreferenceScore = relevance.calculateContentTypePreference(options.userContentPreferences);
    
    // Calculate overall relevance
    relevance.calculateOverallRelevance();
    
    await relevance.save();
    return relevance;
    
  } catch (error) {
    console.error('Error calculating content relevance:', error);
    throw error;
  }
};

// Update actual interaction for learning
contentRelevanceSchema.methods.recordInteraction = function(interactionType, data = {}) {
  this.actualInteraction.viewed = true;
  this.actualInteraction.viewedAt = new Date();
  
  if (data.timeSpent) {
    this.actualInteraction.timeSpentViewing = data.timeSpent;
  }
  
  if (['like', 'comment', 'share', 'click'].includes(interactionType)) {
    this.actualInteraction.engaged = true;
    this.actualInteraction.engagementType = interactionType;
    this.actualInteraction.engagementAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('ContentRelevance', contentRelevanceSchema); 
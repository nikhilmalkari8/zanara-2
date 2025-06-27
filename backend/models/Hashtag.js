const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
  // The hashtag text (without #)
  tag: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 100,
    match: /^[a-zA-Z0-9_]+$/
  },

  // Display version (with original casing)
  displayTag: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  // Category for better organization
  category: {
    type: String,
    enum: [
      'fashion',
      'modeling',
      'photography',
      'design',
      'beauty',
      'lifestyle',
      'career',
      'industry',
      'event',
      'trend',
      'technique',
      'brand',
      'location',
      'general'
    ],
    default: 'general'
  },

  // Usage statistics
  stats: {
    totalUses: { type: Number, default: 0 },
    thisWeekUses: { type: Number, default: 0 },
    thisMonthUses: { type: Number, default: 0 },
    uniqueUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastUsed: Date,
    peakUsage: {
      count: { type: Number, default: 0 },
      date: Date
    }
  },

  // Trending metrics
  trending: {
    score: { type: Number, default: 0 },
    rank: Number,
    isCurrentlyTrending: { type: Boolean, default: false },
    trendingStartDate: Date,
    previousRank: Number
  },

  // Related hashtags for suggestions
  relatedTags: [{
    tag: String,
    coOccurrenceCount: { type: Number, default: 1 }
  }],

  // Seasonal relevance
  seasonal: {
    spring: { type: Number, default: 0 },
    summer: { type: Number, default: 0 },
    fall: { type: Number, default: 0 },
    winter: { type: Number, default: 0 }
  },

  // Admin moderation
  moderation: {
    isApproved: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date
  },

  // Auto-generated description for context
  description: String,

  // Color theme for UI (optional)
  color: {
    type: String,
    match: /^#[0-9A-F]{6}$/i
  }
}, {
  timestamps: true
});

// Indexes for performance
hashtagSchema.index({ tag: 1 });
hashtagSchema.index({ 'stats.totalUses': -1 });
hashtagSchema.index({ 'trending.score': -1 });
hashtagSchema.index({ 'trending.isCurrentlyTrending': 1, 'trending.rank': 1 });
hashtagSchema.index({ category: 1, 'stats.totalUses': -1 });
hashtagSchema.index({ 'stats.lastUsed': -1 });

// Virtual for trending status
hashtagSchema.virtual('isTrending').get(function() {
  return this.trending.isCurrentlyTrending;
});

// Virtual for current season relevance
hashtagSchema.virtual('currentSeasonRelevance').get(function() {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return this.seasonal.spring;
  if (month >= 5 && month <= 7) return this.seasonal.summer;
  if (month >= 8 && month <= 10) return this.seasonal.fall;
  return this.seasonal.winter;
});

// Method to increment usage
hashtagSchema.methods.incrementUsage = async function(userId) {
  this.stats.totalUses += 1;
  this.stats.thisWeekUses += 1;
  this.stats.thisMonthUses += 1;
  this.stats.lastUsed = new Date();
  
  // Add user to unique users if not already present
  if (!this.stats.uniqueUsers.includes(userId)) {
    this.stats.uniqueUsers.push(userId);
  }
  
  // Update peak usage if current usage is higher
  if (this.stats.thisWeekUses > this.stats.peakUsage.count) {
    this.stats.peakUsage.count = this.stats.thisWeekUses;
    this.stats.peakUsage.date = new Date();
  }
  
  await this.save();
};

// Method to calculate trending score
hashtagSchema.methods.calculateTrendingScore = function() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Base score from weekly usage
  let score = this.stats.thisWeekUses * 10;
  
  // Boost for unique users
  score += this.stats.uniqueUsers.length * 5;
  
  // Boost for recent activity
  if (this.stats.lastUsed && this.stats.lastUsed > oneWeekAgo) {
    const hoursAgo = (now - this.stats.lastUsed) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursAgo);
  }
  
  // Seasonal boost
  score += this.currentSeasonRelevance * 2;
  
  // Category boost for fashion-related tags
  if (['fashion', 'modeling', 'design', 'beauty'].includes(this.category)) {
    score *= 1.2;
  }
  
  this.trending.score = Math.round(score);
  return this.trending.score;
};

// Static method to get trending hashtags
hashtagSchema.statics.getTrending = async function(limit = 10, category = null) {
  let query = {
    'moderation.isApproved': true,
    'moderation.isBanned': false
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ 'trending.score': -1, 'stats.thisWeekUses': -1 })
    .limit(limit)
    .select('tag displayTag category stats.totalUses trending.score color');
};

// Static method to get hashtag suggestions
hashtagSchema.statics.getSuggestions = async function(query, limit = 10) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $or: [
      { tag: searchRegex },
      { displayTag: searchRegex }
    ],
    'moderation.isApproved': true,
    'moderation.isBanned': false
  })
  .sort({ 'stats.totalUses': -1 })
  .limit(limit)
  .select('tag displayTag category stats.totalUses');
};

// Static method to get related hashtags
hashtagSchema.statics.getRelated = async function(hashtag, limit = 5) {
  const tag = await this.findOne({ tag: hashtag.toLowerCase() });
  if (!tag) return [];
  
  const relatedTags = tag.relatedTags
    .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
    .slice(0, limit)
    .map(rt => rt.tag);
  
  return this.find({
    tag: { $in: relatedTags },
    'moderation.isApproved': true,
    'moderation.isBanned': false
  })
  .select('tag displayTag category stats.totalUses');
};

// Static method to update trending rankings
hashtagSchema.statics.updateTrendingRankings = async function() {
  const hashtags = await this.find({
    'moderation.isApproved': true,
    'moderation.isBanned': false
  });
  
  // Calculate trending scores for all hashtags
  for (let hashtag of hashtags) {
    hashtag.calculateTrendingScore();
    await hashtag.save();
  }
  
  // Get top trending hashtags
  const trending = await this.find({
    'moderation.isApproved': true,
    'moderation.isBanned': false
  })
  .sort({ 'trending.score': -1 })
  .limit(50);
  
  // Update rankings
  for (let i = 0; i < trending.length; i++) {
    const hashtag = trending[i];
    hashtag.trending.previousRank = hashtag.trending.rank;
    hashtag.trending.rank = i + 1;
    hashtag.trending.isCurrentlyTrending = i < 20; // Top 20 are considered trending
    
    if (hashtag.trending.isCurrentlyTrending && !hashtag.trending.trendingStartDate) {
      hashtag.trending.trendingStartDate = new Date();
    } else if (!hashtag.trending.isCurrentlyTrending) {
      hashtag.trending.trendingStartDate = null;
    }
    
    await hashtag.save();
  }
};

// Static method to reset weekly stats (should be run weekly)
hashtagSchema.statics.resetWeeklyStats = async function() {
  await this.updateMany({}, { 
    $set: { 'stats.thisWeekUses': 0 } 
  });
};

// Static method to reset monthly stats (should be run monthly)
hashtagSchema.statics.resetMonthlyStats = async function() {
  await this.updateMany({}, { 
    $set: { 'stats.thisMonthUses': 0 } 
  });
};

// Static method to create or update hashtag
hashtagSchema.statics.createOrUpdate = async function(tagText, userId, category = 'general') {
  const normalizedTag = tagText.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
  
  let hashtag = await this.findOne({ tag: normalizedTag });
  
  if (hashtag) {
    await hashtag.incrementUsage(userId);
  } else {
    hashtag = new this({
      tag: normalizedTag,
      displayTag: tagText,
      category: category,
      stats: {
        totalUses: 1,
        thisWeekUses: 1,
        thisMonthUses: 1,
        uniqueUsers: [userId],
        lastUsed: new Date()
      }
    });
    await hashtag.save();
  }
  
  return hashtag;
};

module.exports = mongoose.model('Hashtag', hashtagSchema); 
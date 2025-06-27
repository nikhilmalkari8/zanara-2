const mongoose = require('mongoose');

const connectionStrengthSchema = new mongoose.Schema({
  // Core relationship
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Strength metrics (0-100 scale)
  overallStrength: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Individual scoring components
  messageFrequencyScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  profileVisitScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  contentInteractionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  mutualConnectionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  collaborationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  industryAlignmentScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Detailed metrics
  metrics: {
    // Message frequency (last 30 days)
    messageCount30d: { type: Number, default: 0 },
    messageCount7d: { type: Number, default: 0 },
    lastMessageDate: { type: Date },
    
    // Profile visits
    profileVisits30d: { type: Number, default: 0 },
    profileVisits7d: { type: Number, default: 0 },
    lastProfileVisit: { type: Date },
    
    // Content interactions
    likesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    commentsGiven: { type: Number, default: 0 },
    commentsReceived: { type: Number, default: 0 },
    sharesGiven: { type: Number, default: 0 },
    sharesReceived: { type: Number, default: 0 },
    
    // Mutual connections
    mutualConnectionCount: { type: Number, default: 0 },
    mutualConnectionQuality: { type: Number, default: 0 }, // Average strength of mutual connections
    
    // Collaboration history
    projectsCollaborated: { type: Number, default: 0 },
    successfulCollaborations: { type: Number, default: 0 },
    
    // Industry alignment
    sharedIndustryTags: [String],
    industryOverlapPercentage: { type: Number, default: 0 }
  },
  
  // Trend analysis
  trends: {
    strengthTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    weeklyChange: { type: Number, default: 0 },
    monthlyChange: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now }
  },
  
  // Weights for scoring algorithm (can be A/B tested)
  weights: {
    messageFrequency: { type: Number, default: 25 },
    profileVisits: { type: Number, default: 15 },
    contentInteraction: { type: Number, default: 30 },
    mutualConnections: { type: Number, default: 15 },
    collaboration: { type: Number, default: 10 },
    industryAlignment: { type: Number, default: 5 }
  }
}, {
  timestamps: true,
  indexes: [
    { user1: 1, user2: 1 },
    { overallStrength: -1 },
    { 'trends.lastCalculated': 1 }
  ]
});

// Ensure unique connection pairs (bidirectional)
connectionStrengthSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Methods for calculating connection strength
connectionStrengthSchema.methods.calculateMessageFrequencyScore = function() {
  const { messageCount30d, messageCount7d } = this.metrics;
  
  // Score based on message frequency with recent bias
  const recentWeight = messageCount7d * 2;
  const totalMessages = messageCount30d + recentWeight;
  
  // Logarithmic scaling to prevent extreme scores
  return Math.min(100, Math.log10(totalMessages + 1) * 25);
};

connectionStrengthSchema.methods.calculateProfileVisitScore = function() {
  const { profileVisits30d, lastProfileVisit } = this.metrics;
  
  // Score based on visit frequency and recency
  let score = Math.min(100, profileVisits30d * 10);
  
  // Recency bonus
  if (lastProfileVisit) {
    const daysSinceVisit = (Date.now() - lastProfileVisit.getTime()) / (1000 * 60 * 60 * 24);
    const recencyMultiplier = Math.max(0.5, 1 - (daysSinceVisit / 30));
    score *= recencyMultiplier;
  }
  
  return score;
};

connectionStrengthSchema.methods.calculateContentInteractionScore = function() {
  const { 
    likesGiven, likesReceived, 
    commentsGiven, commentsReceived,
    sharesGiven, sharesReceived 
  } = this.metrics;
  
  // Weighted interaction score
  const totalInteractions = 
    (likesGiven + likesReceived) * 1 +
    (commentsGiven + commentsReceived) * 2 +
    (sharesGiven + sharesReceived) * 3;
  
  return Math.min(100, totalInteractions * 2);
};

connectionStrengthSchema.methods.calculateMutualConnectionScore = function() {
  const { mutualConnectionCount, mutualConnectionQuality } = this.metrics;
  
  // Score based on number and quality of mutual connections
  const countScore = Math.min(50, mutualConnectionCount * 5);
  const qualityScore = mutualConnectionQuality || 0;
  
  return (countScore + qualityScore) / 2;
};

connectionStrengthSchema.methods.calculateCollaborationScore = function() {
  const { projectsCollaborated, successfulCollaborations } = this.metrics;
  
  if (projectsCollaborated === 0) return 0;
  
  const successRate = successfulCollaborations / projectsCollaborated;
  const baseScore = Math.min(50, projectsCollaborated * 10);
  
  return baseScore * (0.5 + successRate * 0.5);
};

connectionStrengthSchema.methods.calculateIndustryAlignmentScore = function() {
  return this.metrics.industryOverlapPercentage || 0;
};

connectionStrengthSchema.methods.calculateOverallStrength = function() {
  // Calculate individual scores
  this.messageFrequencyScore = this.calculateMessageFrequencyScore();
  this.profileVisitScore = this.calculateProfileVisitScore();
  this.contentInteractionScore = this.calculateContentInteractionScore();
  this.mutualConnectionScore = this.calculateMutualConnectionScore();
  this.collaborationScore = this.calculateCollaborationScore();
  this.industryAlignmentScore = this.calculateIndustryAlignmentScore();
  
  // Calculate weighted overall score
  const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
  
  const weightedScore = (
    this.messageFrequencyScore * this.weights.messageFrequency +
    this.profileVisitScore * this.weights.profileVisits +
    this.contentInteractionScore * this.weights.contentInteraction +
    this.mutualConnectionScore * this.weights.mutualConnections +
    this.collaborationScore * this.weights.collaboration +
    this.industryAlignmentScore * this.weights.industryAlignment
  ) / totalWeight;
  
  this.overallStrength = Math.round(weightedScore);
  this.trends.lastCalculated = new Date();
  
  return this.overallStrength;
};

// Static methods for bulk operations
connectionStrengthSchema.statics.findOrCreateConnection = async function(user1Id, user2Id) {
  // Ensure consistent ordering (smaller ID first)
  const [userId1, userId2] = [user1Id, user2Id].sort();
  
  let connection = await this.findOne({ user1: userId1, user2: userId2 });
  
  if (!connection) {
    connection = new this({
      user1: userId1,
      user2: userId2
    });
    await connection.save();
  }
  
  return connection;
};

connectionStrengthSchema.statics.updateMessageInteraction = async function(user1Id, user2Id) {
  const connection = await this.findOrCreateConnection(user1Id, user2Id);
  
  connection.metrics.messageCount30d += 1;
  connection.metrics.messageCount7d += 1;
  connection.metrics.lastMessageDate = new Date();
  
  connection.calculateOverallStrength();
  await connection.save();
  
  return connection;
};

connectionStrengthSchema.statics.updateProfileVisit = async function(visitorId, profileOwnerId) {
  if (visitorId.toString() === profileOwnerId.toString()) return; // Don't track self-visits
  
  const connection = await this.findOrCreateConnection(visitorId, profileOwnerId);
  
  connection.metrics.profileVisits30d += 1;
  connection.metrics.profileVisits7d += 1;
  connection.metrics.lastProfileVisit = new Date();
  
  connection.calculateOverallStrength();
  await connection.save();
  
  return connection;
};

connectionStrengthSchema.statics.updateContentInteraction = async function(actorId, contentOwnerId, interactionType) {
  if (actorId.toString() === contentOwnerId.toString()) return; // Don't track self-interactions
  
  const connection = await this.findOrCreateConnection(actorId, contentOwnerId);
  
  switch (interactionType) {
    case 'like':
      connection.metrics.likesGiven += 1;
      break;
    case 'comment':
      connection.metrics.commentsGiven += 1;
      break;
    case 'share':
      connection.metrics.sharesGiven += 1;
      break;
  }
  
  connection.calculateOverallStrength();
  await connection.save();
  
  return connection;
};

// Pre-save middleware to calculate strength
connectionStrengthSchema.pre('save', function(next) {
  if (this.isModified('metrics') || this.isNew) {
    this.calculateOverallStrength();
  }
  next();
});

module.exports = mongoose.model('ConnectionStrength', connectionStrengthSchema); 
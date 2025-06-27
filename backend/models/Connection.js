const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  // Users involved in the connection
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Connection status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  
  // Optional message with connection request
  message: {
    type: String,
    maxlength: 500
  },
  
  // Connection metadata
  connectedAt: {
    type: Date
  },
  
  // Interaction tracking
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  
  // WEEK 3: Connection Strength Scoring
  connectionStrength: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    factors: {
      // Interaction-based factors
      messagesExchanged: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      activityInteractions: { type: Number, default: 0 }, // likes, comments, shares
      
      // Network-based factors
      mutualConnections: { type: Number, default: 0 },
      mutualConnectionsScore: { type: Number, default: 0 },
      
      // Professional similarity factors
      sameIndustry: { type: Boolean, default: false },
      sameProfessionalType: { type: Boolean, default: false },
      sameLocation: { type: Boolean, default: false },
      skillsOverlap: { type: Number, default: 0 },
      
      // Engagement factors
      responseRate: { type: Number, default: 0 }, // How often they respond to each other
      initiationBalance: { type: Number, default: 50 }, // Balance of who initiates conversations
      recentActivity: { type: Number, default: 0 }, // Recent interactions weight
      
      // Quality factors
      connectionDuration: { type: Number, default: 0 }, // Days since connection
      endorsements: { type: Number, default: 0 },
      collaborations: { type: Number, default: 0 }
    },
    lastCalculated: { type: Date, default: Date.now },
    trend: { type: String, enum: ['increasing', 'stable', 'decreasing'], default: 'stable' }
  },
  
  // Interaction history
  interactions: [{
    type: { 
      type: String, 
      enum: ['message', 'profile_view', 'activity_like', 'activity_comment', 'activity_share', 'endorsement', 'collaboration'] 
    },
    timestamp: { type: Date, default: Date.now },
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Connection tags/categories
  tags: [String],
  category: {
    type: String,
    enum: ['professional', 'collaborator', 'mentor', 'mentee', 'peer', 'client', 'service_provider'],
    default: 'professional'
  },
  
  // Connection notes (private)
  notes: {
    requesterNotes: String,
    recipientNotes: String
  },
  
  // Connection preferences
  preferences: {
    allowMessages: { type: Boolean, default: true },
    allowEndorsements: { type: Boolean, default: true },
    allowCollaborations: { type: Boolean, default: true },
    notificationFrequency: { type: String, enum: ['immediate', 'daily', 'weekly', 'never'], default: 'immediate' }
  },
  
  // Mutual connections count (cached for performance)
  mutualConnectionsCount: {
    type: Number,
    default: 0
  },
  
  // FIXED: Connection types with ALL professional types
  requesterType: {
    type: String,
    enum: [
      'model', 
      'photographer', 
      'fashion-designer', 
      'stylist', 
      'makeup-artist', 
      'brand', 
      'agency'
    ],
    required: true
  },
  recipientType: {
    type: String,
    enum: [
      'model', 
      'photographer', 
      'fashion-designer', 
      'stylist', 
      'makeup-artist', 
      'brand', 
      'agency'
    ],
    required: true
  },
  
  // Optional: Relationship type for categorization
  relationship: {
    type: String,
    enum: [
      'colleague',
      'collaborator', 
      'client',
      'mentor',
      'friend',
      'industry-contact',
      'other'
    ],
    default: 'colleague'
  }
}, {
  timestamps: true
});

// Indexes for performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });
connectionSchema.index({ 'connectionStrength.score': -1 });
connectionSchema.index({ 'connectionStrength.lastCalculated': 1 });
connectionSchema.index({ requesterType: 1, recipientType: 1 });

// Virtual for getting the other user in a connection
connectionSchema.virtual('otherUser').get(function() {
  // This virtual will be populated based on context
  return null;
});

// Method to check if users are connected
connectionSchema.statics.areConnected = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!connection;
};

// Method to get connection status between two users
connectionSchema.statics.getConnectionStatus = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
  
  if (!connection) return null;
  
  return {
    status: connection.status,
    requester: connection.requester.toString(),
    recipient: connection.recipient.toString(),
    connectionId: connection._id
  };
};

// Method to get mutual connections between two users
connectionSchema.statics.getMutualConnections = async function(userId1, userId2) {
  // Get all connections for both users
  const user1Connections = await this.find({
    $or: [
      { requester: userId1, status: 'accepted' },
      { recipient: userId1, status: 'accepted' }
    ]
  });
  
  const user2Connections = await this.find({
    $or: [
      { requester: userId2, status: 'accepted' },
      { recipient: userId2, status: 'accepted' }
    ]
  });
  
  // Extract connected user IDs
  const user1ConnectedIds = user1Connections.map(conn => 
    conn.requester.toString() === userId1.toString() ? conn.recipient.toString() : conn.requester.toString()
  );
  
  const user2ConnectedIds = user2Connections.map(conn => 
    conn.requester.toString() === userId2.toString() ? conn.recipient.toString() : conn.requester.toString()
  );
  
  // Find mutual connections
  const mutualIds = user1ConnectedIds.filter(id => user2ConnectedIds.includes(id));
  
  // Get user details for mutual connections
  const User = require('./User');
  const mutualUsers = await User.find({
    _id: { $in: mutualIds }
  }).select('firstName lastName email professionalType userType');
  
  return mutualUsers;
};

// Method to update connection strength based on interactions
connectionSchema.methods.updateConnectionStrength = function(interactionType) {
  const strengthIncrements = {
    'message': 2,
    'profile_view': 1,
    'opportunity_interaction': 3,
    'endorsement': 5,
    'recommendation': 10
  };
  
  const increment = strengthIncrements[interactionType] || 1;
  this.connectionStrength.score = Math.min(100, this.connectionStrength.score + increment);
  this.lastInteraction = new Date();
  
  return this.save();
};

// Pre-save middleware to set connectedAt when status changes to accepted
connectionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'accepted' && !this.connectedAt) {
    this.connectedAt = new Date();
  }
  next();
});

// Prevent duplicate connections
connectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingConnection = await this.constructor.findOne({
      $or: [
        { requester: this.requester, recipient: this.recipient },
        { requester: this.recipient, recipient: this.requester }
      ]
    });

    if (existingConnection) {
      const error = new Error('Connection already exists');
      error.status = 400;
      return next(error);
    }
  }
  next();
});

// Method to get connection statistics by professional type
connectionSchema.statics.getConnectionStatsByProfessionalType = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { requester: new mongoose.Types.ObjectId(userId), status: 'accepted' },
          { recipient: new mongoose.Types.ObjectId(userId), status: 'accepted' }
        ]
      }
    },
    {
      $addFields: {
        otherUserType: {
          $cond: {
            if: { $eq: ['$requester', new mongoose.Types.ObjectId(userId)] },
            then: '$recipientType',
            else: '$requesterType'
          }
        }
      }
    },
    {
      $group: {
        _id: '$otherUserType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  return stats;
};

// WEEK 3: Connection Strength Calculation Methods
connectionSchema.methods.calculateConnectionStrength = async function() {
  const User = mongoose.model('User');
  const Activity = mongoose.model('Activity');
  const Message = mongoose.model('Message');
  
  try {
    const user1 = await User.findById(this.requester);
    const user2 = await User.findById(this.recipient);
    
    if (!user1 || !user2) return 0;
    
    let score = 0;
    const factors = this.connectionStrength.factors;
    
    // 1. Professional Similarity (20% weight)
    let professionalScore = 0;
    if (user1.professionalType === user2.professionalType) {
      factors.sameProfessionalType = true;
      professionalScore += 15;
    }
    
    // Industry similarity
    if (user1.industry === user2.industry) {
      factors.sameIndustry = true;
      professionalScore += 10;
    }
    
    // Location similarity
    if (user1.location?.city === user2.location?.city) {
      factors.sameLocation = true;
      professionalScore += 8;
    }
    
    // Skills overlap
    const user1Skills = user1.skills || [];
    const user2Skills = user2.skills || [];
    const commonSkills = user1Skills.filter(skill => user2Skills.includes(skill));
    factors.skillsOverlap = commonSkills.length;
    professionalScore += Math.min(commonSkills.length * 2, 15);
    
    score += professionalScore * 0.2;
    
    // 2. Mutual Connections (15% weight)
    const mutualConnections = await this.constructor.aggregate([
      {
        $match: {
          status: 'accepted',
          $or: [
            { requester: this.requester, recipient: { $ne: this.recipient } },
            { recipient: this.requester, requester: { $ne: this.recipient } }
          ]
        }
      },
      {
        $lookup: {
          from: 'connections',
          let: { 
            otherUser: {
              $cond: [
                { $eq: ['$requester', this.requester] },
                '$recipient',
                '$requester'
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'accepted'] },
                    {
                      $or: [
                        { $and: [{ $eq: ['$requester', '$$otherUser'] }, { $eq: ['$recipient', this.recipient] }] },
                        { $and: [{ $eq: ['$recipient', '$$otherUser'] }, { $eq: ['$requester', this.recipient] }] }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'mutualConnection'
        }
      },
      {
        $match: { 'mutualConnection.0': { $exists: true } }
      },
      {
        $count: 'count'
      }
    ]);
    
    const mutualCount = mutualConnections[0]?.count || 0;
    factors.mutualConnections = mutualCount;
    factors.mutualConnectionsScore = Math.min(mutualCount * 3, 20);
    score += factors.mutualConnectionsScore * 0.15;
    
    // 3. Interaction Frequency (25% weight)
    const recentInteractions = this.interactions.filter(
      interaction => interaction.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    factors.recentActivity = recentInteractions.length;
    const interactionScore = Math.min(recentInteractions.length * 2, 25);
    score += interactionScore * 0.25;
    
    // 4. Message Exchange Quality (20% weight)
    if (Message) {
      const messageStats = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: this.requester, recipient: this.recipient },
              { sender: this.recipient, recipient: this.requester }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            user1Messages: {
              $sum: { $cond: [{ $eq: ['$sender', this.requester] }, 1, 0] }
            },
            user2Messages: {
              $sum: { $cond: [{ $eq: ['$sender', this.recipient] }, 1, 0] }
            },
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ]);
      
      if (messageStats[0]) {
        factors.messagesExchanged = messageStats[0].totalMessages;
        
        // Calculate balance (closer to 50-50 is better)
        const balance = messageStats[0].user1Messages / messageStats[0].totalMessages * 100;
        factors.initiationBalance = Math.abs(50 - balance);
        
        const messageScore = Math.min(messageStats[0].totalMessages * 0.5, 15) + 
                           Math.max(0, 10 - factors.initiationBalance / 5);
        score += messageScore * 0.2;
      }
    }
    
    // 5. Activity Engagement (10% weight)
    if (Activity) {
      const activityEngagement = await Activity.aggregate([
        {
          $match: {
            $or: [
              { actor: this.requester },
              { actor: this.recipient }
            ]
          }
        },
        {
          $project: {
            actor: 1,
            engagements: {
              $concatArrays: [
                '$engagement.reactions',
                '$engagement.comments',
                '$engagement.shares'
              ]
            }
          }
        },
        {
          $unwind: '$engagements'
        },
        {
          $match: {
            $or: [
              { 'engagements.user': this.requester, actor: this.recipient },
              { 'engagements.user': this.recipient, actor: this.requester }
            ]
          }
        },
        {
          $count: 'totalEngagements'
        }
      ]);
      
      factors.activityInteractions = activityEngagement[0]?.totalEngagements || 0;
      const engagementScore = Math.min(factors.activityInteractions * 1.5, 15);
      score += engagementScore * 0.1;
    }
    
    // 6. Connection Duration (5% weight)
    const connectionDays = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
    factors.connectionDuration = connectionDays;
    const durationScore = Math.min(connectionDays * 0.1, 10);
    score += durationScore * 0.05;
    
    // 7. Endorsements and Collaborations (5% weight)
    // This would be calculated based on endorsement and collaboration data
    const endorsementScore = Math.min(factors.endorsements * 2, 5) + 
                            Math.min(factors.collaborations * 3, 5);
    score += endorsementScore * 0.05;
    
    // Normalize to 0-100 scale
    score = Math.min(Math.max(score, 0), 100);
    
    // Determine trend
    const previousScore = this.connectionStrength.score;
    let trend = 'stable';
    if (score > previousScore + 5) trend = 'increasing';
    else if (score < previousScore - 5) trend = 'decreasing';
    
    // Update connection strength
    this.connectionStrength.score = Math.round(score);
    this.connectionStrength.trend = trend;
    this.connectionStrength.lastCalculated = new Date();
    
    await this.save();
    return this.connectionStrength.score;
    
  } catch (error) {
    console.error('Error calculating connection strength:', error);
    return this.connectionStrength.score;
  }
};

// Method to add interaction
connectionSchema.methods.addInteraction = async function(type, initiator, metadata = {}) {
  this.interactions.push({
    type,
    initiator,
    metadata,
    timestamp: new Date()
  });
  
  // Limit interactions history to last 100 entries
  if (this.interactions.length > 100) {
    this.interactions = this.interactions.slice(-100);
  }
  
  await this.save();
  
  // Recalculate strength if significant interaction
  if (['message', 'activity_like', 'activity_comment', 'endorsement'].includes(type)) {
    await this.calculateConnectionStrength();
  }
};

// Static method to get connection strength between two users
connectionSchema.statics.getConnectionStrength = async function(user1Id, user2Id) {
  const connection = await this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id }
    ],
    status: 'accepted'
  });
  
  if (!connection) return 0;
  
  // Recalculate if older than 24 hours
  const lastCalculated = connection.connectionStrength.lastCalculated;
  if (!lastCalculated || Date.now() - lastCalculated > 24 * 60 * 60 * 1000) {
    await connection.calculateConnectionStrength();
  }
  
  return connection.connectionStrength.score;
};

// Static method to get strongest connections for a user
connectionSchema.statics.getStrongestConnections = async function(userId, limit = 10) {
  return this.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ],
    status: 'accepted'
  })
  .populate('requester', 'firstName lastName professionalType profilePicture')
  .populate('recipient', 'firstName lastName professionalType profilePicture')
  .sort({ 'connectionStrength.score': -1 })
  .limit(limit);
};

// Static method to get connection analytics
connectionSchema.statics.getConnectionAnalytics = async function(userId) {
  const connections = await this.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ],
    status: 'accepted'
  });
  
  const totalConnections = connections.length;
  const avgStrength = connections.reduce((sum, conn) => sum + conn.connectionStrength.score, 0) / totalConnections || 0;
  
  const strengthDistribution = {
    strong: connections.filter(conn => conn.connectionStrength.score >= 70).length,
    medium: connections.filter(conn => conn.connectionStrength.score >= 40 && conn.connectionStrength.score < 70).length,
    weak: connections.filter(conn => conn.connectionStrength.score < 40).length
  };
  
  const trendAnalysis = {
    increasing: connections.filter(conn => conn.connectionStrength.trend === 'increasing').length,
    stable: connections.filter(conn => conn.connectionStrength.trend === 'stable').length,
    decreasing: connections.filter(conn => conn.connectionStrength.trend === 'decreasing').length
  };
  
  return {
    totalConnections,
    avgStrength: Math.round(avgStrength),
    strengthDistribution,
    trendAnalysis,
    strongestConnections: await this.getStrongestConnections(userId, 5)
  };
};

module.exports = mongoose.model('Connection', connectionSchema);
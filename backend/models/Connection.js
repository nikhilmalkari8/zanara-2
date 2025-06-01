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
    enum: ['pending', 'accepted', 'blocked', 'cancelled'],
    default: 'pending'
  },
  
  // Relationship details
  relationship: {
    type: String,
    enum: [
      'colleague', 'client', 'agency-representative', 'photographer', 
      'makeup-artist', 'stylist', 'creative-director', 'casting-director',
      'brand-representative', 'mentor', 'mentee', 'collaborator', 'other'
    ],
    default: 'other'
  },
  
  // Optional message with connection request
  message: {
    type: String,
    maxLength: 500
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
  
  // Connection strength (based on interactions)
  connectionStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  
  // Tags for categorizing connections
  tags: [{
    type: String,
    maxLength: 50
  }],
  
  // Notes about the connection (private)
  notes: {
    requesterNotes: String,
    recipientNotes: String
  },
  
  // Mutual connections count (cached for performance)
  mutualConnectionsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });

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
  }).select('firstName lastName email userType');
  
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
  this.connectionStrength = Math.min(100, this.connectionStrength + increment);
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

module.exports = mongoose.model('Connection', connectionSchema);
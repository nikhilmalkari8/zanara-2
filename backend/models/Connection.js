const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  // Users involved in the connection
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Connection status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  // Optional message with connection request
  message: {
    type: String,
    trim: true,
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
    senderNotes: String,
    receiverNotes: String
  },
  
  // Mutual connections count (cached for performance)
  mutualConnectionsCount: {
    type: Number,
    default: 0
  },
  
  // Connection types
  senderType: {
    type: String,
    enum: ['model', 'designer', 'photographer', 'stylist'],
    required: true
  },
  receiverType: {
    type: String,
    enum: ['model', 'designer', 'photographer', 'stylist'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });
connectionSchema.index({ status: 1 });
connectionSchema.index({ createdAt: -1 });

// Virtual for getting the other user in a connection
connectionSchema.virtual('otherUser').get(function() {
  // This virtual will be populated based on context
  return null;
});

// Method to check if users are connected
connectionSchema.statics.areConnected = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { sender: userId1, receiver: userId2, status: 'accepted' },
      { sender: userId2, receiver: userId1, status: 'accepted' }
    ]
  });
  return !!connection;
};

// Method to get connection status between two users
connectionSchema.statics.getConnectionStatus = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ]
  });
  
  if (!connection) return null;
  
  return {
    status: connection.status,
    sender: connection.sender.toString(),
    receiver: connection.receiver.toString(),
    connectionId: connection._id
  };
};

// Method to get mutual connections between two users
connectionSchema.statics.getMutualConnections = async function(userId1, userId2) {
  // Get all connections for both users
  const user1Connections = await this.find({
    $or: [
      { sender: userId1, status: 'accepted' },
      { receiver: userId1, status: 'accepted' }
    ]
  });
  
  const user2Connections = await this.find({
    $or: [
      { sender: userId2, status: 'accepted' },
      { receiver: userId2, status: 'accepted' }
    ]
  });
  
  // Extract connected user IDs
  const user1ConnectedIds = user1Connections.map(conn => 
    conn.sender.toString() === userId1.toString() ? conn.receiver.toString() : conn.sender.toString()
  );
  
  const user2ConnectedIds = user2Connections.map(conn => 
    conn.sender.toString() === userId2.toString() ? conn.receiver.toString() : conn.sender.toString()
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

// Prevent duplicate connections
connectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingConnection = await this.constructor.findOne({
      $or: [
        { sender: this.sender, receiver: this.receiver },
        { sender: this.receiver, receiver: this.sender }
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

module.exports = mongoose.model('Connection', connectionSchema);
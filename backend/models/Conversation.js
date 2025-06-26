const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  title: {
    type: String,
    maxlength: 100
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mutedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mutedUntil: {
      type: Date
    }
  }],
  metadata: {
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowImageSharing: {
      type: Boolean,
      default: true
    },
    autoDeleteMessages: {
      type: Boolean,
      default: false
    },
    autoDeleteAfterDays: {
      type: Number,
      default: 30
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ 'metadata.opportunityId': 1 });
conversationSchema.index({ 'metadata.bookingId': 1 });

// Static method to find or create conversation between users
conversationSchema.statics.findOrCreateDirectConversation = async function(user1Id, user2Id) {
  // Look for existing conversation between these two users
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 }
  }).populate('participants', 'firstName lastName email profilePicture')
    .populate('lastMessage');

  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: [user1Id, user2Id],
      type: 'direct'
    });
    await conversation.save();
    await conversation.populate('participants', 'firstName lastName email profilePicture');
  }

  return conversation;
};

// Instance method to add participant
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to check if user is participant
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Instance method to archive conversation for user
conversationSchema.methods.archiveForUser = function(userId) {
  const existingArchive = this.archivedBy.find(a => a.user.toString() === userId.toString());
  if (!existingArchive) {
    this.archivedBy.push({ user: userId, archivedAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to unarchive conversation for user
conversationSchema.methods.unarchiveForUser = function(userId) {
  this.archivedBy = this.archivedBy.filter(a => a.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to check if conversation is archived for user
conversationSchema.methods.isArchivedForUser = function(userId) {
  return this.archivedBy.some(a => a.user.toString() === userId.toString());
};

// Instance method to mute conversation for user
conversationSchema.methods.muteForUser = function(userId, mutedUntil = null) {
  const existingMute = this.mutedBy.find(m => m.user.toString() === userId.toString());
  if (existingMute) {
    existingMute.mutedUntil = mutedUntil;
  } else {
    this.mutedBy.push({ user: userId, mutedUntil });
  }
  return this.save();
};

// Instance method to unmute conversation for user
conversationSchema.methods.unmuteForUser = function(userId) {
  this.mutedBy = this.mutedBy.filter(m => m.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to check if conversation is muted for user
conversationSchema.methods.isMutedForUser = function(userId) {
  const mute = this.mutedBy.find(m => m.user.toString() === userId.toString());
  if (!mute) return false;
  if (!mute.mutedUntil) return true;
  return new Date() < mute.mutedUntil;
};

// Instance method to update last activity
conversationSchema.methods.updateLastActivity = function(messageId = null) {
  this.lastActivity = new Date();
  if (messageId) {
    this.lastMessage = messageId;
  }
  return this.save();
};

// Instance method to get other participant (for direct conversations)
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  if (this.type !== 'direct') return null;
  return this.participants.find(p => p._id.toString() !== currentUserId.toString());
};

// Virtual for conversation display name
conversationSchema.virtual('displayName').get(function() {
  if (this.title) return this.title;
  if (this.type === 'direct' && this.participants.length === 2) {
    return this.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ');
  }
  return `Group (${this.participants.length} members)`;
});

// Ensure virtual fields are serialized
conversationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Conversation', conversationSchema); 
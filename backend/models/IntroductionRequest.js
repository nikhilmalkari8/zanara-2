const mongoose = require('mongoose');

const introductionRequestSchema = new mongoose.Schema({
  // The person requesting the introduction
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The person being asked to make the introduction (mutual connection)
  introducer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The person they want to be introduced to
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Request details
  subject: {
    type: String,
    required: true,
    maxLength: 200
  },
  
  message: {
    type: String,
    required: true,
    maxLength: 1000
  },
  
  // Why they want the introduction
  purpose: {
    type: String,
    enum: [
      'business-opportunity', 'collaboration', 'networking', 
      'job-opportunity', 'mentorship', 'advice', 'partnership', 'other'
    ],
    required: true
  },
  
  // Status of the introduction request
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Introducer's response
  introducerResponse: {
    message: String,
    respondedAt: Date
  },
  
  // Introduction message sent by introducer (if accepted)
  introductionMessage: {
    subject: String,
    message: String,
    sentAt: Date
  },
  
  // Target's response to introduction
  targetResponse: {
    accepted: {
      type: Boolean,
      default: null
    },
    message: String,
    respondedAt: Date
  },
  
  // Follow-up tracking
  followUpReminders: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['introducer_reminder', 'completion_check']
    }
  }],
  
  // Metadata
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Indexes
introductionRequestSchema.index({ requester: 1, status: 1 });
introductionRequestSchema.index({ introducer: 1, status: 1 });
introductionRequestSchema.index({ target: 1, status: 1 });
introductionRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if introduction is possible
introductionRequestSchema.statics.canIntroduce = async function(requesterId, introducerId, targetId) {
  const Connection = require('./Connection');
  
  // Check if introducer is connected to both requester and target
  const requesterConnection = await Connection.areConnected(requesterId, introducerId);
  const targetConnection = await Connection.areConnected(introducerId, targetId);
  
  if (!requesterConnection || !targetConnection) {
    return {
      possible: false,
      reason: 'Introducer must be connected to both parties'
    };
  }
  
  // Check if requester and target are already connected
  const alreadyConnected = await Connection.areConnected(requesterId, targetId);
  if (alreadyConnected) {
    return {
      possible: false,
      reason: 'Users are already connected'
    };
  }
  
  // Check for recent introduction requests
  const recentRequest = await this.findOne({
    requester: requesterId,
    target: targetId,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  
  if (recentRequest) {
    return {
      possible: false,
      reason: 'Recent introduction request already exists'
    };
  }
  
  return { possible: true };
};

// Method to create introduction message
introductionRequestSchema.methods.createIntroductionMessage = function(customMessage) {
  const defaultTemplate = `Hi {{targetName}},

I'd like to introduce you to {{requesterName}}, who reached out to me about {{purpose}}.

{{requesterMessage}}

{{requesterName}}, meet {{targetName}}.
{{targetName}}, meet {{requesterName}}.

I'll let you both take it from here!

Best regards,
{{introducerName}}`;

  return customMessage || defaultTemplate;
};

// Method to send introduction
introductionRequestSchema.methods.sendIntroduction = async function(customMessage) {
  const User = require('./User');
  
  const [requester, introducer, target] = await Promise.all([
    User.findById(this.requester).select('firstName lastName email'),
    User.findById(this.introducer).select('firstName lastName email'),
    User.findById(this.target).select('firstName lastName email')
  ]);
  
  const template = this.createIntroductionMessage(customMessage);
  
  // Replace template variables
  const introMessage = template
    .replace(/{{targetName}}/g, `${target.firstName} ${target.lastName}`)
    .replace(/{{requesterName}}/g, `${requester.firstName} ${requester.lastName}`)
    .replace(/{{introducerName}}/g, `${introducer.firstName} ${introducer.lastName}`)
    .replace(/{{purpose}}/g, this.purpose.replace('-', ' '))
    .replace(/{{requesterMessage}}/g, this.message);
  
  this.introductionMessage = {
    subject: `Introduction: ${requester.firstName} ${requester.lastName} <> ${target.firstName} ${target.lastName}`,
    message: introMessage,
    sentAt: new Date()
  };
  
  this.status = 'completed';
  
  // Here you would integrate with your notification/email system
  // For now, we'll just save the introduction message
  
  return this.save();
};

module.exports = mongoose.model('IntroductionRequest', introductionRequestSchema);
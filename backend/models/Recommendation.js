const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  // Author of the recommendation
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Person being recommended
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Professional relationship
  relationship: {
    type: String,
    required: true,
    enum: [
      'colleague',
      'manager',
      'direct_report',
      'client',
      'collaborator',
      'mentor',
      'mentee',
      'service_provider',
      'business_partner',
      'other'
    ]
  },
  
  // Recommendation content
  content: {
    type: String,
    required: true,
    maxlength: 3000
  },
  
  // Skills highlighted in the recommendation
  skills: [{
    type: String,
    trim: true
  }],
  
  // Projects mentioned
  projects: [{
    name: String,
    description: String,
    role: String
  }],
  
  // Status of the recommendation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // When recipient responded
  respondedAt: Date,
  
  // Visibility settings
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  
  // Recommendation quality metrics
  metrics: {
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    endorsements: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      endorsedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Working period details
  workingPeriod: {
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
  },
  
  // Context information
  context: {
    company: String,
    position: String,
    department: String,
    projectType: String
  }
}, {
  timestamps: true
});

// Indexes
recommendationSchema.index({ author: 1, createdAt: -1 });
recommendationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
recommendationSchema.index({ status: 1 });

// Virtual for recommendation summary
recommendationSchema.virtual('summary').get(function() {
  return this.content.length > 150 
    ? this.content.substring(0, 150) + '...'
    : this.content;
});

// Method to check if user can view this recommendation
recommendationSchema.methods.canView = function(userId) {
  if (this.status !== 'approved') {
    return this.author.toString() === userId.toString() || 
           this.recipient.toString() === userId.toString();
  }
  
  switch (this.visibility) {
    case 'public':
      return true;
    case 'connections':
      // Would need to check if user is connected to recipient
      return true; // Simplified for now
    case 'private':
      return this.author.toString() === userId.toString() || 
             this.recipient.toString() === userId.toString();
    default:
      return false;
  }
};

// Static method to get recommendations for user profile
recommendationSchema.statics.getProfileRecommendations = async function(userId, viewerId = null) {
  const query = {
    recipient: userId,
    status: 'approved'
  };
  
  // Apply visibility filter if viewer is not the profile owner
  if (viewerId && viewerId.toString() !== userId.toString()) {
    query.visibility = { $in: ['public', 'connections'] };
  }
  
  return await this.find(query)
    .populate('author', 'firstName lastName professionalType profilePicture headline')
    .sort({ createdAt: -1 })
    .limit(10);
};

module.exports = mongoose.model('Recommendation', recommendationSchema); 
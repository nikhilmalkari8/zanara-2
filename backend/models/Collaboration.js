const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  // Basic Project Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    maxLength: 2000
  },
  type: {
    type: String,
    enum: ['project', 'moodboard', 'collection', 'campaign', 'photoshoot', 'fashion-show'],
    required: true
  },
  
  // Project Owner & Team
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer', 'contributor'],
      default: 'contributor'
    },
    permissions: {
      canEdit: { type: Boolean, default: true },
      canComment: { type: Boolean, default: true },
      canInvite: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Fashion-Specific Metadata
  fashionMetadata: {
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'resort', 'pre-fall']
    },
    year: Number,
    brand: String,
    collection: String,
    theme: String,
    targetAudience: String,
    priceRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    categories: [{
      type: String,
      enum: [
        'womenswear', 'menswear', 'childrenswear', 'accessories',
        'footwear', 'lingerie', 'activewear', 'sustainable',
        'luxury', 'streetwear', 'bridal', 'costume'
      ]
    }],
    styles: [String], // boho, minimalist, avant-garde, etc.
    colors: [String], // hex codes or color names
    fabrics: [String],
    sizes: [String]
  },
  
  // Moodboard & Visual Elements
  moodboard: {
    layout: {
      type: String,
      enum: ['grid', 'freeform', 'magazine', 'pinterest'],
      default: 'grid'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    images: [{
      url: String,
      caption: String,
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 200 },
        height: { type: Number, default: 200 }
      },
      rotation: { type: Number, default: 0 },
      zIndex: { type: Number, default: 1 },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      tags: [String],
      source: String, // portfolio, inspiration, reference
      linkedPortfolioItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortfolioItem'
      }
    }],
    textElements: [{
      content: String,
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
      },
      fontSize: { type: Number, default: 16 },
      fontFamily: { type: String, default: 'Arial' },
      color: { type: String, default: '#000000' },
      rotation: { type: Number, default: 0 },
      zIndex: { type: Number, default: 1 }
    }],
    colorPalette: [{
      color: String, // hex code
      name: String,
      pantone: String,
      usage: String // primary, secondary, accent
    }]
  },
  
  // Project Tasks & Timeline
  tasks: [{
    title: String,
    description: String,
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed', 'cancelled'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: Date,
    completedAt: Date,
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timeline & Milestones
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      title: String,
      description: String,
      date: Date,
      status: {
        type: String,
        enum: ['upcoming', 'in-progress', 'completed', 'delayed'],
        default: 'upcoming'
      },
      dependencies: [String] // milestone IDs
    }]
  },
  
  // Comments & Discussions
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    attachments: [{
      filename: String,
      originalName: String,
      url: String
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    editedAt: Date
  }],
  
  // File Management
  files: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    category: {
      type: String,
      enum: ['design', 'reference', 'fabric', 'pattern', 'photo', 'document', 'other'],
      default: 'other'
    },
    tags: [String],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    },
    previousVersions: [{
      filename: String,
      url: String,
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  
  // Approval Workflow
  approvals: [{
    type: {
      type: String,
      enum: ['design', 'concept', 'final', 'budget', 'timeline'],
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'needs-changes'],
        default: 'pending'
      },
      comment: String,
      approvedAt: Date
    }],
    deadline: Date,
    attachments: [{
      filename: String,
      url: String
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs-changes'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Integration with Other Features
  linkedItems: {
    opportunities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    }],
    bookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }],
    jobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }],
    portfolios: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio'
    }]
  },
  
  // Project Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'team'
  },
  
  // Analytics & Metrics
  analytics: {
    views: { type: Number, default: 0 },
    collaboratorActivity: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      lastActive: Date,
      contributionScore: { type: Number, default: 0 }
    }],
    taskCompletionRate: { type: Number, default: 0 },
    averageTaskTime: { type: Number, default: 0 } // in hours
  },
  
  // Settings
  settings: {
    allowPublicViewing: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    slackIntegration: { type: Boolean, default: false },
    autoSave: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for performance
collaborationSchema.index({ owner: 1, type: 1 });
collaborationSchema.index({ 'collaborators.user': 1 });
collaborationSchema.index({ status: 1, visibility: 1 });
collaborationSchema.index({ 'fashionMetadata.season': 1, 'fashionMetadata.year': 1 });
collaborationSchema.index({ createdAt: -1 });

// Virtual for project completion percentage
collaborationSchema.virtual('completionPercentage').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// Virtual for active collaborators count
collaborationSchema.virtual('activeCollaboratorsCount').get(function() {
  if (!this.collaborators) return 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.analytics.collaboratorActivity.filter(activity => 
    activity.lastActive && activity.lastActive > thirtyDaysAgo
  ).length;
});

// Method to check if user is collaborator
collaborationSchema.methods.isCollaborator = function(userId) {
  return this.owner.toString() === userId.toString() || 
         this.collaborators.some(collab => collab.user.toString() === userId.toString());
};

// Method to get user permissions
collaborationSchema.methods.getUserPermissions = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    return {
      canEdit: true,
      canComment: true,
      canInvite: true,
      canDelete: true,
      role: 'owner'
    };
  }
  
  const collaborator = this.collaborators.find(collab => 
    collab.user.toString() === userId.toString()
  );
  
  if (collaborator) {
    return {
      ...collaborator.permissions,
      role: collaborator.role
    };
  }
  
  return {
    canEdit: false,
    canComment: this.visibility === 'public',
    canInvite: false,
    canDelete: false,
    role: 'none'
  };
};

// Method to add collaborator
collaborationSchema.methods.addCollaborator = function(userId, role = 'contributor', invitedBy) {
  const existingCollaborator = this.collaborators.find(collab => 
    collab.user.toString() === userId.toString()
  );
  
  if (!existingCollaborator) {
    const permissions = {
      canEdit: role !== 'viewer',
      canComment: true,
      canInvite: role === 'admin',
      canDelete: role === 'admin'
    };
    
    this.collaborators.push({
      user: userId,
      role,
      permissions,
      invitedBy
    });
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to update task completion rate
collaborationSchema.methods.updateTaskCompletionRate = function() {
  if (this.tasks.length === 0) {
    this.analytics.taskCompletionRate = 0;
  } else {
    const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.analytics.taskCompletionRate = Math.round((completedTasks / this.tasks.length) * 100);
  }
  return this.save();
};

// Method to record collaborator activity
collaborationSchema.methods.recordActivity = function(userId) {
  let activity = this.analytics.collaboratorActivity.find(a => 
    a.user.toString() === userId.toString()
  );
  
  if (activity) {
    activity.lastActive = new Date();
    activity.contributionScore += 1;
  } else {
    this.analytics.collaboratorActivity.push({
      user: userId,
      lastActive: new Date(),
      contributionScore: 1
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Collaboration', collaborationSchema); 
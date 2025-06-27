const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // Basic Contract Information
  contractId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Related Entities
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Parties
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contract Details
  type: {
    type: String,
    enum: [
      'one-time-project',
      'ongoing-retainer',
      'milestone-based',
      'hourly-contract',
      'fixed-price',
      'commission-based',
      'revenue-share'
    ],
    required: true
  },
  
  // Scope of Work
  scope: {
    description: {
      type: String,
      required: true
    },
    deliverables: [{
      name: String,
      description: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'submitted', 'approved', 'rejected'],
        default: 'pending'
      }
    }],
    timeline: {
      startDate: Date,
      endDate: Date,
      duration: {
        value: Number,
        unit: String
      }
    },
    revisions: {
      included: {
        type: Number,
        default: 2
      },
      additionalCost: Number
    }
  },
  
  // Financial Terms
  financial: {
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentStructure: {
      type: String,
      enum: ['upfront', 'milestone', 'completion', 'hourly', 'monthly'],
      required: true
    },
    milestones: [{
      name: String,
      description: String,
      amount: Number,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'due', 'paid', 'disputed'],
        default: 'pending'
      },
      paidAt: Date
    }],
    expenses: {
      covered: Boolean,
      maxAmount: Number,
      requiresApproval: Boolean
    },
    lateFees: {
      enabled: Boolean,
      percentage: Number,
      gracePeriod: Number // days
    }
  },
  
  // Escrow System
  escrow: {
    enabled: {
      type: Boolean,
      default: true
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'internal'],
      default: 'stripe'
    },
    totalHeld: {
      type: Number,
      default: 0
    },
    releases: [{
      amount: Number,
      milestone: String,
      releasedAt: Date,
      releasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }],
    disputes: [{
      amount: Number,
      reason: String,
      filedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      filedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'under-review', 'resolved', 'escalated'],
        default: 'pending'
      },
      resolution: String,
      resolvedAt: Date
    }]
  },
  
  // Legal Terms
  legal: {
    copyrightOwnership: {
      type: String,
      enum: ['client', 'professional', 'shared', 'work-for-hire'],
      default: 'client'
    },
    usageRights: {
      commercial: Boolean,
      editorial: Boolean,
      exclusivity: {
        type: String,
        enum: ['exclusive', 'non-exclusive', 'limited'],
        default: 'non-exclusive'
      },
      duration: String,
      territory: String
    },
    confidentiality: {
      required: Boolean,
      duration: String,
      terms: String
    },
    cancellation: {
      noticePeriod: Number, // days
      refundPolicy: String,
      killFee: {
        percentage: Number,
        conditions: String
      }
    },
    liability: {
      limitAmount: Number,
      exclusions: [String]
    },
    disputeResolution: {
      method: {
        type: String,
        enum: ['mediation', 'arbitration', 'litigation'],
        default: 'mediation'
      },
      jurisdiction: String
    }
  },
  
  // Contract Status & Workflow
  status: {
    type: String,
    enum: [
      'draft',           // Being prepared
      'pending-review',  // Sent for review
      'under-negotiation', // Being negotiated
      'pending-signature', // Ready for signing
      'signed',          // Fully executed
      'active',          // Work in progress
      'completed',       // Work finished
      'cancelled',       // Contract cancelled
      'disputed',        // Under dispute
      'terminated'       // Contract terminated
    ],
    default: 'draft'
  },
  
  // Signatures
  signatures: {
    client: {
      signed: Boolean,
      signedAt: Date,
      ipAddress: String,
      userAgent: String,
      signature: String // Base64 encoded signature image
    },
    professional: {
      signed: Boolean,
      signedAt: Date,
      ipAddress: String,
      userAgent: String,
      signature: String
    }
  },
  
  // Communication & Updates
  communications: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    type: {
      type: String,
      enum: ['comment', 'revision-request', 'approval', 'dispute', 'milestone-update'],
      default: 'comment'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String]
  }],
  
  // Document Management
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['contract', 'amendment', 'work-sample', 'invoice', 'receipt', 'other']
    },
    url: String,
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
    }
  }],
  
  // Performance Tracking
  performance: {
    startedAt: Date,
    completedAt: Date,
    actualDuration: Number, // days
    onTime: Boolean,
    onBudget: Boolean,
    clientSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    },
    professionalSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    }
  },
  
  // Compliance & Audit
  compliance: {
    taxDocuments: [{
      type: String, // 1099, W9, etc.
      url: String,
      year: Number
    }],
    auditTrail: [{
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }]
  },
  
  // Template & Automation
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContractTemplate'
  },
  customTerms: String,
  
  // Metadata
  version: {
    type: Number,
    default: 1
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Generate unique contract ID
contractSchema.pre('save', function(next) {
  if (!this.contractId) {
    this.contractId = 'CT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Indexes
contractSchema.index({ contractId: 1 });
contractSchema.index({ client: 1, professional: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'financial.paymentStructure': 1 });
contractSchema.index({ createdAt: -1 });

// Virtual for contract completion percentage
contractSchema.virtual('completionPercentage').get(function() {
  if (!this.scope.deliverables || this.scope.deliverables.length === 0) return 0;
  
  const completedDeliverables = this.scope.deliverables.filter(d => d.status === 'approved').length;
  return Math.round((completedDeliverables / this.scope.deliverables.length) * 100);
});

// Virtual for payment completion percentage
contractSchema.virtual('paymentPercentage').get(function() {
  if (!this.financial.milestones || this.financial.milestones.length === 0) return 0;
  
  const paidMilestones = this.financial.milestones.filter(m => m.status === 'paid').length;
  return Math.round((paidMilestones / this.financial.milestones.length) * 100);
});

// Virtual for next milestone due
contractSchema.virtual('nextMilestoneDue').get(function() {
  if (!this.financial.milestones) return null;
  
  const pendingMilestones = this.financial.milestones
    .filter(m => m.status === 'pending' || m.status === 'due')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
  return pendingMilestones.length > 0 ? pendingMilestones[0] : null;
});

// Method to check if both parties have signed
contractSchema.methods.isFullySigned = function() {
  return this.signatures.client.signed && this.signatures.professional.signed;
};

// Method to calculate total amount paid
contractSchema.methods.getTotalPaid = function() {
  if (!this.financial.milestones) return 0;
  return this.financial.milestones
    .filter(m => m.status === 'paid')
    .reduce((total, m) => total + m.amount, 0);
};

// Method to calculate remaining amount
contractSchema.methods.getRemainingAmount = function() {
  return this.financial.totalAmount - this.getTotalPaid();
};

// Method to check if contract is overdue
contractSchema.methods.isOverdue = function() {
  if (!this.scope.timeline.endDate) return false;
  return new Date() > new Date(this.scope.timeline.endDate) && this.status === 'active';
};

// Method to add communication
contractSchema.methods.addCommunication = function(senderId, message, type = 'comment', attachments = []) {
  this.communications.push({
    sender: senderId,
    message,
    type,
    attachments
  });
  return this.save();
};

// Method to update milestone status
contractSchema.methods.updateMilestoneStatus = function(milestoneIndex, status, userId) {
  if (this.financial.milestones[milestoneIndex]) {
    this.financial.milestones[milestoneIndex].status = status;
    if (status === 'paid') {
      this.financial.milestones[milestoneIndex].paidAt = new Date();
    }
    
    // Add to audit trail
    this.compliance.auditTrail.push({
      action: `Milestone ${milestoneIndex + 1} status updated to ${status}`,
      performedBy: userId,
      details: `Milestone: ${this.financial.milestones[milestoneIndex].name}`
    });
  }
  return this.save();
};

module.exports = mongoose.model('Contract', contractSchema); 
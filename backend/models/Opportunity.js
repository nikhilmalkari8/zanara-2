const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  },
  
  // Company Reference
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Opportunity Type
  type: {
    type: String,
    required: true,
    enum: [
      'fashion-shoot',
      'commercial-shoot',
      'runway-show',
      'catalog-shoot',
      'editorial-shoot',
      'beauty-shoot',
      'lifestyle-shoot',
      'product-modeling',
      'brand-ambassador',
      'event-modeling',
      'fit-modeling',
      'promotional-work',
      'other'
    ]
  },
  
  // Location Details
  location: {
    type: {
      type: String,
      enum: ['on-location', 'studio', 'remote', 'multiple-locations'],
      default: 'on-location'
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    address: String,
    venue: String,
    isRemoteAvailable: {
      type: Boolean,
      default: false
    }
  },
  
  // Compensation
  compensation: {
    type: {
      type: String,
      enum: ['paid', 'tfp', 'expenses-only', 'mixed'],
      required: true
    },
    amount: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    paymentStructure: {
      type: String,
      enum: ['hourly', 'daily', 'project-based', 'per-shot'],
      default: 'project-based'
    },
    details: String,
    additionalBenefits: [String]
  },
  
  // Timeline
  shootDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  applicationDeadline: {
    type: Date,
    required: true
  },
  duration: {
    hours: Number,
    days: Number,
    details: String
  },
  timeFlexible: {
    type: Boolean,
    default: false
  },
  
  // Model Requirements
  requirements: {
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'any'],
      default: 'any'
    },
    ageRange: {
      min: {
        type: Number,
        min: 16,
        max: 100
      },
      max: {
        type: Number,
        min: 16,
        max: 100
      }
    },
    height: {
      min: String, // e.g., "5'6\"" or "168cm"
      max: String,
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      }
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'experienced', 'professional', 'any'],
      default: 'any'
    },
    bodyType: [String],
    ethnicity: [String],
    hairColor: [String],
    eyeColor: [String],
    specialSkills: [String],
    languages: [String],
    wardrobeRequirements: [String],
    additionalNotes: String
  },
  
  // Application Process
  applicationProcess: {
    requiresPortfolio: {
      type: Boolean,
      default: true
    },
    requiresCoverLetter: {
      type: Boolean,
      default: false
    },
    customQuestions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'radio', 'file'],
        default: 'text'
      },
      options: [String],
      required: {
        type: Boolean,
        default: false
      }
    }],
    applicationLimit: Number,
    instructions: String
  },
  
  // Applications
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'selected', 'rejected'],
      default: 'pending'
    },
    coverLetter: String,
    customAnswers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      question: String,
      answer: String
    }],
    portfolioUrls: [String],
    companyNotes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    viewedAt: Date
  }],
  
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'filled', 'cancelled'],
    default: 'published'
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  saves: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags and Categories
  tags: [String],
  category: String,
  
  // Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    autoReply: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: String
    }
  },
  
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Indexes
opportunitySchema.index({ title: 'text', description: 'text' });
opportunitySchema.index({ type: 1, status: 1 });
opportunitySchema.index({ 'location.city': 1, 'location.country': 1 });
opportunitySchema.index({ applicationDeadline: 1, status: 1 });
opportunitySchema.index({ company: 1, createdAt: -1 });
opportunitySchema.index({ slug: 1 });

// Generate slug before saving
opportunitySchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + this._id.toString().slice(-6);
  }
  next();
});

// Virtuals
opportunitySchema.virtual('applicationCount').get(function() {
  return this.applications ? this.applications.length : 0;
});

opportunitySchema.virtual('daysRemaining').get(function() {
  if (!this.applicationDeadline) return null;
  const today = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

opportunitySchema.virtual('isExpired').get(function() {
  return new Date(this.applicationDeadline) < new Date();
});

// Methods
opportunitySchema.methods.canUserApply = function(userId) {
  if (this.status !== 'published') return false;
  if (this.isExpired) return false;
  
  const hasApplied = this.applications.some(app => 
    app.applicant.toString() === userId.toString()
  );
  return !hasApplied;
};

opportunitySchema.methods.getApplicationByUser = function(userId) {
  return this.applications.find(app => 
    app.applicant.toString() === userId.toString()
  );
};

module.exports = mongoose.model('Opportunity', opportunitySchema);
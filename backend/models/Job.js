const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 10000
  },
  shortDescription: {
    type: String,
    maxLength: 300,
    trim: true
  },
  
  // Job Poster
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Job Category & Type
  category: {
    type: String,
    required: true,
    enum: [
      'fashion-design',
      'photography',
      'modeling',
      'styling',
      'makeup-artistry',
      'creative-direction',
      'production',
      'marketing',
      'business',
      'technical',
      'other'
    ]
  },
  jobType: {
    type: String,
    required: true,
    enum: [
      'full-time',
      'part-time',
      'freelance',
      'contract',
      'internship',
      'temporary',
      'project-based',
      'gig'
    ]
  },
  workFormat: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid', 'travel-required'],
    default: 'on-site'
  },
  
  // Specific Role Details
  roleSpecifics: {
    // For Models
    modelingType: {
      type: String,
      enum: [
        'fashion', 'commercial', 'runway', 'editorial', 'beauty', 
        'fitness', 'plus-size', 'petite', 'hand', 'foot', 'hair',
        'lifestyle', 'product', 'brand-ambassador', 'fit-model'
      ]
    },
    // For Photographers
    photographyType: {
      type: String,
      enum: [
        'fashion', 'portrait', 'commercial', 'editorial', 'beauty',
        'product', 'lifestyle', 'event', 'wedding', 'headshot'
      ]
    },
    // For Designers
    designType: {
      type: String,
      enum: [
        'womenswear', 'menswear', 'childrenswear', 'accessories',
        'footwear', 'lingerie', 'activewear', 'sustainable',
        'luxury', 'streetwear', 'bridal', 'costume'
      ]
    },
    // For Stylists
    stylingType: {
      type: String,
      enum: [
        'fashion', 'celebrity', 'editorial', 'commercial', 'personal',
        'wardrobe', 'set', 'prop', 'hair', 'makeup'
      ]
    }
  },
  
  // Target Professional Types
  targetProfessionalTypes: [{
    type: String,
    enum: [
      'model', 'photographer', 'fashion-designer', 'stylist', 
      'makeup-artist', 'hair-stylist', 'creative-director',
      'producer', 'fashion-student', 'brand', 'agency'
    ]
  }],
  
  // Location & Travel
  location: {
    type: {
      type: String,
      enum: ['specific', 'multiple', 'remote', 'travel'],
      default: 'specific'
    },
    city: String,
    state: String,
    country: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    additionalLocations: [{
      city: String,
      state: String,
      country: String
    }],
    travelRequired: {
      type: Boolean,
      default: false
    },
    travelDetails: String
  },
  
  // Compensation & Budget
  compensation: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'project', 'commission', 'equity', 'negotiable', 'unpaid'],
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
      enum: ['upfront', 'milestone', 'completion', 'monthly', 'weekly'],
      default: 'completion'
    },
    benefits: [String],
    expenses: {
      covered: Boolean,
      details: String
    },
    details: String
  },
  
  // Timeline & Schedule
  timeline: {
    startDate: Date,
    endDate: Date,
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months']
      }
    },
    deadline: Date,
    flexible: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: String,
      enum: ['full-time', 'part-time', 'evenings', 'weekends', 'flexible'],
      default: 'flexible'
    },
    timezone: String
  },
  
  // Requirements & Qualifications
  requirements: {
    experience: {
      level: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'expert', 'any'],
        default: 'any'
      },
      years: {
        min: Number,
        max: Number
      },
      specific: [String]
    },
    skills: {
      required: [String],
      preferred: [String],
      software: [String],
      equipment: [String]
    },
    education: {
      level: {
        type: String,
        enum: ['none', 'high-school', 'associate', 'bachelor', 'master', 'phd', 'certification']
      },
      field: String,
      certifications: [String]
    },
    portfolio: {
      required: {
        type: Boolean,
        default: true
      },
      specifications: String
    },
    physical: {
      // For models
      gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'any']
      },
      ageRange: {
        min: Number,
        max: Number
      },
      height: {
        min: String,
        max: String,
        unit: String
      },
      measurements: {
        bust: String,
        waist: String,
        hips: String
      },
      bodyType: [String],
      ethnicity: [String],
      hairColor: [String],
      eyeColor: [String]
    },
    languages: [String],
    availability: String,
    other: String
  },
  
  // Application Process
  applicationProcess: {
    method: {
      type: String,
      enum: ['platform', 'email', 'external', 'invitation-only'],
      default: 'platform'
    },
    deadline: Date,
    customQuestions: [{
      question: String,
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'multiselect', 'file'],
        default: 'text'
      },
      options: [String],
      required: {
        type: Boolean,
        default: false
      }
    }],
    requiredDocuments: [String],
    instructions: String,
    applicationLimit: Number,
    autoReply: {
      enabled: Boolean,
      message: String
    }
  },
  
  // Bidding System (for freelance/project jobs)
  bidding: {
    enabled: {
      type: Boolean,
      default: false
    },
    budgetRange: {
      min: Number,
      max: Number
    },
    bids: [{
      bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: Number,
      proposal: String,
      timeline: String,
      submittedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
      }
    }],
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    biddingDeadline: Date
  },
  
  // Contract & Legal
  contract: {
    required: {
      type: Boolean,
      default: false
    },
    template: String,
    terms: String,
    ndaRequired: {
      type: Boolean,
      default: false
    },
    copyrightTerms: String,
    cancellationPolicy: String
  },
  
  // Status & Workflow
  status: {
    type: String,
    enum: [
      'draft',          // Being created
      'published',      // Live and accepting applications
      'paused',         // Temporarily not accepting applications
      'in-review',      // Reviewing applications
      'interviewing',   // Conducting interviews
      'filled',         // Position filled
      'cancelled',      // Job cancelled
      'expired',        // Application deadline passed
      'completed'       // Job completed
    ],
    default: 'draft'
  },
  
  // Applications
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: String,
    customAnswers: [{
      question: String,
      answer: String
    }],
    portfolioUrls: [String],
    documents: [String],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // SEO & Discovery
  tags: [String],
  keywords: [String],
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  
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
  shares: {
    type: Number,
    default: 0
  },
  
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
    showCompanyName: {
      type: Boolean,
      default: true
    },
    hideApplicantCount: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  externalId: String,
  source: {
    type: String,
    enum: ['internal', 'imported', 'api'],
    default: 'internal'
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }
}, {
  timestamps: true
});

// Indexes for performance and search
jobSchema.index({ status: 1, category: 1 });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
jobSchema.index({ targetProfessionalTypes: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ 'compensation.type': 1 });
jobSchema.index({ 'timeline.deadline': 1 });
jobSchema.index({ 'applicationProcess.deadline': 1 });
jobSchema.index({ featured: 1, urgent: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ views: -1 });

// Text search index
jobSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  keywords: 'text'
});

// Compound indexes for common queries
jobSchema.index({ category: 1, jobType: 1, status: 1 });
jobSchema.index({ targetProfessionalTypes: 1, 'location.city': 1 });
jobSchema.index({ status: 1, featured: 1, createdAt: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications ? this.applications.length : 0;
});

// Virtual for bid count
jobSchema.virtual('bidCount').get(function() {
  return this.bidding?.bids ? this.bidding.bids.length : 0;
});

// Virtual for days until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationProcess?.deadline) return null;
  const now = new Date();
  const deadline = new Date(this.applicationProcess.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for job urgency score
jobSchema.virtual('urgencyScore').get(function() {
  let score = 0;
  if (this.urgent) score += 50;
  if (this.featured) score += 30;
  
  const daysUntilDeadline = this.daysUntilDeadline;
  if (daysUntilDeadline !== null) {
    if (daysUntilDeadline <= 1) score += 40;
    else if (daysUntilDeadline <= 3) score += 30;
    else if (daysUntilDeadline <= 7) score += 20;
  }
  
  return Math.min(score, 100);
});

// Method to check if user can apply
jobSchema.methods.canUserApply = function(userId) {
  if (this.status !== 'published') return false;
  if (this.applicationProcess?.deadline && new Date() > this.applicationProcess.deadline) return false;
  if (this.applicationProcess?.applicationLimit && this.applicationCount >= this.applicationProcess.applicationLimit) return false;
  
  // Check if user already applied
  const hasApplied = this.applications.some(app => app.applicant.toString() === userId.toString());
  if (hasApplied) return false;
  
  return true;
};

// Method to get application by user
jobSchema.methods.getUserApplication = function(userId) {
  return this.applications.find(app => app.applicant.toString() === userId.toString());
};

// Method to calculate match score for a user
jobSchema.methods.calculateMatchScore = function(userProfile) {
  let score = 0;
  let maxScore = 0;
  
  // Professional type match (40 points)
  maxScore += 40;
  if (this.targetProfessionalTypes.includes(userProfile.professionalType)) {
    score += 40;
  }
  
  // Location match (20 points)
  maxScore += 20;
  if (this.workFormat === 'remote' || 
      (userProfile.location && this.location?.city && 
       userProfile.location.toLowerCase().includes(this.location.city.toLowerCase()))) {
    score += 20;
  }
  
  // Experience match (20 points)
  maxScore += 20;
  if (this.requirements?.experience?.level) {
    const experienceMap = { 'entry': 1, 'junior': 2, 'mid': 3, 'senior': 4, 'expert': 5 };
    const jobLevel = experienceMap[this.requirements.experience.level] || 0;
    const userLevel = experienceMap[userProfile.experienceLevel] || 0;
    
    if (userLevel >= jobLevel) score += 20;
    else if (Math.abs(userLevel - jobLevel) === 1) score += 10;
  }
  
  // Skills match (20 points)
  maxScore += 20;
  if (this.requirements?.skills?.required && userProfile.skills) {
    const requiredSkills = this.requirements.skills.required;
    const userSkills = userProfile.skills;
    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    score += Math.min(20, (matchingSkills.length / requiredSkills.length) * 20);
  }
  
  return Math.round((score / maxScore) * 100);
};

module.exports = mongoose.model('Job', jobSchema); 